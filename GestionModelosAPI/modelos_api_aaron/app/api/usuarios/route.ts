import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next'


import { Usuario } from '../../types/usuarios'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
const supabase = createClient(supabaseUrl, supabaseKey)


//El GET permite obtener un listado de todos los usuarios, o los datos de un usuario especificado por Id o nombre
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
          { error: 'Faltan campos requeridos' },
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

  //El PUT puede tomar el id o el nombre del usuario como parametro de busqueda para actualizarlo.
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

// A pesar de la relación entre ambas tablas, borrar un usuario con este DELETE NO borra sus modelos correspondientes. He tomado esta medida porque lso datos de los modelos pueden ser importantes y 
// necesitarse aun tras eliminar un usuario,y porque siempre pueden ser reasignados a otro usuario en caso de necesidad. Podemos implementar esto en el front, con una segunda llamada, 
// ya que el DELETE de modelos permite borrar todos los modelos de un mismo usuario, y borra las metricas y logs de estos en cascada. La base de datos admite nulos en el UserId de los modelos, y autoasigna null a los vacíos.

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