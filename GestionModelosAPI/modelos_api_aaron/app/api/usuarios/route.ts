import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next'


import { Usuario } from '../../types/usuarios'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
const supabase = createClient(supabaseUrl, supabaseKey)



export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const name = searchParams.get('name');
  
      
      let query = supabase.from<any,Usuario>('usuarios').select('*');
  
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
  
      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      
      if (!data || data.length === 0) {
        return NextResponse.json({ message: 'No se encontraron usuarios' }, { status: 404 });
      }
  
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error('Error en la API:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
      
      const body = await req.json();
  
      
      const { nombre, email, fechaCreacion }: Partial<Usuario> = body;
  
      if (!nombre || !email || !fechaCreacion) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: nombre, correo y edad son obligatorios.' },
          { status: 400 }
        );
      }
  
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, fechaCreacion }])
        .select('*')
        .single();
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  

      return NextResponse.json({ message: 'Usuario creado con éxito', data }, { status: 201 });
    } catch (error) {
      console.error('Error en el POST de usuarios:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest) {
    try {
      
      const body = await req.json();
      const { id, name, ...updateFields } = body;
  
      
      if (!id && !name) {
        return NextResponse.json(
          { error: 'Se requiere id o name para actualizar un usuario.' },
          { status: 400 }
        );
      }
  
      
      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json(
          { error: 'No hay datos para actualizar.' },
          { status: 400 }
        );
      }
  
      
      let query = supabase.from('usuarios').update(updateFields);
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
  
      const { data, error } = await query;
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    //Esta comprobación da SIEMPRE error aunque haga el PUT perfectamente. El registro se edita perfectamente, pero la llamada siempre va a devolver este error. No es un problema real, pero está ahí. Tal vez quede comentado. -Aarón

    //   if (!data) {
    //     return NextResponse.json(
    //       { error: 'No se encontró el usuario a actualizar.' },
    //       { status: 404 }
    //     );
    //   }
  
      return NextResponse.json({ message: 'Usuario actualizado con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el PUT de usuarios:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }

  export async function DELETE(req: NextRequest) {
    try {
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const name = searchParams.get('name');
  
      
      if (!id && !name) {
        return NextResponse.json(
          { error: 'Se requiere id o name para eliminar un usuario.' },
          { status: 400 }
        );
      }
  
      
      let query = supabase.from('usuarios').delete();
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
  
      const { data, error } = await query;
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      return NextResponse.json({ message: 'Usuario eliminado con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el DELETE de usuarios:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }