import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Cita } from '../modules/citas/cita.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [Cita],
  subscribers: [],
  migrations: [],
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
    // Añadidas opciones para mantener vivas las conexiones en el pooler de Supabase
    keepAlive: true,
  },
  // La propiedad ssl de nivel raíz a veces entra en conflicto con 'extra'
});
