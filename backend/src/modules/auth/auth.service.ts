import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const validateUserCredentials = async (
  email: string,
  password: string,
) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('USER_NOT_FOUND');
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);      
  if (!isPasswordValid) {
    throw new Error('INVALID_PASSWORD');
  }
  const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  phone?: string,
) => {

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }
  const hashedPassword = await bcryptjs.hash(password, 10);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert([
      { 
        id, 
        email, 
        password: hashedPassword, 
        name, 
        phone: phone || null, 
        role: 'PATIENT', 
        createdAt: now, 
        updatedAt: now 
      }
    ])
    .select()
    .single();

  if (insertError || !user) {
    console.error('SUPABASE ERROR:', insertError);
    throw new Error('ERROR_CREATING_USER');
  }

  const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

export const logout = async () => {
  return { success: true };
};

export const recoverPassword = async (email: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return { email, success: true };
};

export const getProfile = async (userId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, createdAt')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
};

