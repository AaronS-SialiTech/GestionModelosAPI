import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserAndPermissions } from '../../lib/permisos';
import { Usuario } from '@/app/types/usuarios';
import { getAuth } from "@clerk/nextjs/server";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';



const supabase = createClient(supabaseUrl, supabaseKey);


export async function GET(req: NextRequest) {
  try {
    const user =await getUserAndPermissions(req);
   // console.info('fgsgdsgfdsgfdsfdsgdsgds',userId)
    if(!user){
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }
 console.info('Usuario obtenido',user);
 var us=user as Usuario
 console.info('Rol', us);
 const authData = getAuth(req);

  return NextResponse.json({ message: user }, { status: 200 });



} catch (error) {
      console.error('Error en la API:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

