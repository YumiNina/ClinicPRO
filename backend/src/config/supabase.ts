import { createClient } from '@supabase/supabase-js';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL as string;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    realtime: {
      transport: ws as unknown as WebSocketLikeConstructor,
    },
  }
);
