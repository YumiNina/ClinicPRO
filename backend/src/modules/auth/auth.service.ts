import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '../../config/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

type TokenPayload = {
  id: string;
  email: string;
  rol: string;
};

type AuthUserRow = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
  password_hash?: string;
};

const createSessionForUser = async (user: AuthUserRow) => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase.from('sesiones').insert({
    id: uuidv4(),
    usuario_id: user.id,
    token_refresco: refreshToken,
    expira_en: expiresAt.toISOString(),
    revocado: false,
  });

  await supabase
    .from('usuarios')
    .update({ ultimo_login: new Date().toISOString() })
    .eq('id', user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      nombre_completo: user.nombre_completo,
      email: user.email,
      rol: user.rol,
    },
  };
};

const getGoogleProfile = async (supabaseAccessToken: string) => {
  const { data, error } = await supabase.auth.getUser(supabaseAccessToken);

  if (error || !data.user?.email) {
    throw new Error('INVALID_GOOGLE_TOKEN');
  }

  const metadata = data.user.user_metadata || {};
  const fullName =
    metadata.full_name ||
    metadata.name ||
    data.user.email.split('@')[0].replace(/[._-]+/g, ' ');

  return {
    email: data.user.email.toLowerCase(),
    nombre_completo: String(fullName).trim(),
  };
};

export const authService = {
  async register(data: {
    nombre_completo: string;
    email: string;
    password: string;
    rol: string;
  }) {
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('INVALID_REGISTER');
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const { data: newUser, error } = await supabase
      .from('usuarios')
      .insert({
        id: uuidv4(),
        nombre_completo: data.nombre_completo,
        email: data.email,
        password_hash,
        rol: data.rol,
        activo: true,
      })
      .select('id, nombre_completo, email, rol, activo, created_at')
      .single();

    if (error) throw error;

    return newUser;
  },

  async login(email: string, password: string) {
    const { data: user } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .maybeSingle();

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    return createSessionForUser(user);
  },

  async googleSession(supabaseAccessToken: string) {
    const googleProfile = await getGoogleProfile(supabaseAccessToken);

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email, rol, activo')
      .eq('email', googleProfile.email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return {
        status: 'requires_role_selection',
        email: googleProfile.email,
        nombre_completo: googleProfile.nombre_completo,
      };
    }

    if (!user.activo) {
      return {
        status: 'inactive',
        email: googleProfile.email,
        nombre_completo: user.nombre_completo,
      };
    }

    return {
      status: 'authenticated',
      ...(await createSessionForUser(user)),
    };
  },

  async registerGoogleReceptionist(
    supabaseAccessToken: string,
    nombre_completo: string
  ) {
    const googleProfile = await getGoogleProfile(supabaseAccessToken);

    const { data: existingUser, error: existingUserError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email, rol, activo')
      .eq('email', googleProfile.email)
      .maybeSingle();

    if (existingUserError) throw existingUserError;

    if (existingUser) {
      if (!existingUser.activo) {
        throw new Error('INACTIVE_USER');
      }

      return createSessionForUser(existingUser);
    }

    const { data: newUser, error } = await supabase
      .from('usuarios')
      .insert({
        id: uuidv4(),
        nombre_completo,
        email: googleProfile.email,
        password_hash: `oauth:google:${googleProfile.email}`,
        rol: 'recepcionista',
        activo: true,
      })
      .select('id, nombre_completo, email, rol, activo')
      .single();

    if (error) throw error;

    return createSessionForUser(newUser);
  },

  async refresh(oldRefreshToken: string) {
    const decoded = verifyRefreshToken(oldRefreshToken) as TokenPayload;

    const { data: session } = await supabase
      .from('sesiones')
      .select('*')
      .eq('token_refresco', oldRefreshToken)
      .eq('revocado', false)
      .maybeSingle();

    if (!session) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    if (session.expira_en && new Date(session.expira_en) < new Date()) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    await supabase
      .from('sesiones')
      .update({ revocado: true })
      .eq('id', session.id);

    const payload: TokenPayload = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from('sesiones').insert({
      id: uuidv4(),
      usuario_id: decoded.id,
      token_refresco: refreshToken,
      expira_en: expiresAt.toISOString(),
      revocado: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  async logout(refreshToken: string) {
    await supabase
      .from('sesiones')
      .update({ revocado: true })
      .eq('token_refresco', refreshToken);

    return true;
  },

  async getProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email, rol, activo, ultimo_login, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return user;
  },
};
