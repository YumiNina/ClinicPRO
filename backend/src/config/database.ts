import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Cita } from '../entities/Cita';
import { Penalizacion } from '../entities/Penalizacion';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true, // ¡En producción cambia a false y usa migraciones!
  logging: true, // Lo cambié a true momentáneamente para ver el ciclo de vida de la conexión
  entities: [Cita, Penalizacion],
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
