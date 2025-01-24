import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '../../lib/supabaseClient'
import { hasPermission } from '@/app/lib/permisos';
import { Usuario } from '../../types/usuarios'
import { createClient } from '@supabase/supabase-js';

//El GET permite obtener un listado de todos los usuarios, o los datos de un usuario especificado por Id o email
export async function GET(req: NextRequest) {
  if (await hasPermission(['*'], req) === false) {
      return NextResponse.json({ error: 'No tienes permiso para acceder a esta ruta' }, { status: 403 });
    }  
  try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const email = searchParams.get('email');
      const clerkId = searchParams.get('clerkId');
  
      
      let query = supabase.from<any,Usuario>('usuarios').select('*');
  
      if (id) query = query.eq('id', id);
      if (email) query = query.eq('email', email);
      if (clerkId) query = query.eq('clerkId', clerkId);
  
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
  if (await hasPermission(['*'], req) === false) {
      return NextResponse.json({ error: 'No tienes permiso para acceder a esta ruta' }, { status: 403 });
    }  
  try {
      
      const body = await req.json();
  
      
      const { nombre, email, fechaCreacion, clerkId }: Partial<Usuario> = body;
  
      if (!nombre || !email || !fechaCreacion || !clerkId) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }
  
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, fechaCreacion, clerkId }])
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
    if (await hasPermission(['*'], req) === false) {
        return NextResponse.json({ error: 'No tienes permiso para acceder a esta ruta' }, { status: 403 });
      }
    try {
      
      const body = await req.json();
      const { id, email, clerkId, ...updateFields } = body;
  
      
      if (!id && !email && !clerkId) {
        return NextResponse.json(
          { error: 'Se requiere id, email, o id de clerk para actualizar un usuario.' },
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
      if (email) query = query.eq('email', email);
  
      const { data, error } = await query;
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

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
    if (await hasPermission(['*'], req) === false) {
      return NextResponse.json({ error: 'No tienes permiso para acceder a esta ruta' }, { status: 403 });
    }
    try {
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const email = searchParams.get('email');
      const clerkId = searchParams.get('clerkId');
      
      if (!id && !email&& !clerkId) {
        return NextResponse.json(
          { error: 'Se requiere id o email para eliminar un usuario.' },
          { status: 400 }
        );
      }
  
  
      let query = supabase.from('usuarios').delete();
      if (id) query = query.eq('id', id);
      if (email) query = query.eq('email', email);
      if (clerkId) query = query.eq('clerkId', clerkId);
  
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