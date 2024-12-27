import { createClient } from '@supabase/supabase-js';


// BD en plataforma de Supabase

  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
  // const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
   
// BD en contenedor Docker local

   const supabaseUrl = 'http://localhost:8000'
   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

   export const supabase = createClient(supabaseUrl, supabaseKey)

if (!supabase) {
  throw new Error('No Supabase client')
}
else {
  console.log('Supabase client created')

}

export default withAuth(async (req, res) => {
  const { user } = req.auth;

  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Usa el user.id para interactuar con Supabase
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
});