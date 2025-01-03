import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';



const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      throw new Error(error.message);
      console.info('Error en la conexión a la API')
    }
    else{
        console.info('API conectada')
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
