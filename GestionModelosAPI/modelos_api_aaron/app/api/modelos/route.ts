import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next'


import { Modelo } from '../../types/modelos'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
const supabase = createClient(supabaseUrl, supabaseKey)


//El GET permite obtener un listado de todos los modelos, o los datos de un modelo especificado por Id o nombre

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const name = searchParams.get('name');
  
      
      let query = supabase.from('modelos').select('*');
  
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
  
      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      
      if (!data || data.length === 0) {
        return NextResponse.json({ message: 'No se encontró el modelo(s) correspondiente(s).' }, { status: 404 });
      }
  
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error('Error en la API:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}


//A pesar de que el POST requiera un UserId, este es nullable en la base de datos para evitar conflictos al eliminar usuarios.
export async function POST(req: NextRequest) {
    try {
      
      const body = await req.json();
  
      
      const { nombre, descripcion, version, fecha_despliegue, UsuarioId }: Partial<Modelo> = body;
  
        console.info('nombre:', nombre); 
        console.info('descripcion:', descripcion);
        console.info('version:', version);
        console.info('fechaDespliegue:', fecha_despliegue);
        console.info('usuarioId:', UsuarioId);

      if (!nombre || !descripcion || !version || !fecha_despliegue || !UsuarioId) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }
  
      
      const { data, error } = await supabase
        .from('modelos')
        .insert([{ nombre, descripcion, version, fecha_despliegue, UsuarioId }])
        .select('*')
        .single();
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  

      return NextResponse.json({ message: 'Modelo creado con éxito', data }, { status: 201 });
    } catch (error) {
      console.error('Error en el POST de modelos:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }

  //El PUT puede tomar el id o el nombre del modelo como parametro de busqueda para actualizarlo.

  export async function PUT(req: NextRequest) {
    try {
      
      const body = await req.json();
      const { id, name, ...updateFields } = body;
  
      
      if (!id && !name) {
        return NextResponse.json(
          { error: 'Se requiere id o name para actualizar un modelo.' },
          { status: 400 }
        );
      }
  
      
      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json(
          { error: 'No hay datos para actualizar.' },
          { status: 400 }
        );
      }
  
      
      let query = supabase.from('modelos').update(updateFields);
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
      
      const { data, error } = await query;
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    //Esta comprobación da SIEMPRE error aunque haga el PUT perfectamente. El registro se edita perfectamente, pero la llamada siempre va a devolver este error. No es un problema real, pero está ahí. Tal vez quede comentado. -Aarón

    //   if (!data) {
    //     return NextResponse.json(
    //       { error: 'No se encontró el modelo a actualizar.' },
    //       { status: 404 }
    //     );
    //   }
  
      return NextResponse.json({ message: 'Modelo actualizado con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el PUT de modelos:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }

  //El DELETE de modelos puede tomar el id o el nombre del modelo como parametro, y elimina los logs y metricas de este en cascada para evitar conflictos. Esto es también soportado por la base de datos de supabase, por lo que
  //si por cualquier error la API no es capaz de eliminar los logs o modelos, la propia base de datos lo hará. Eso hace el borrado en cascada algo redundante, pero asegura que no haya datos inutiles o conflictivos en la bd.

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
  
      
      let query = supabase.from('modelos').delete();
      if (id) query = query.eq('id', id);
      if (name) query = query.eq('nombre', name);
  
      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: 'Error al eliminar el modelo: ' + error.message }, { status: 400 });
      }
      

      let queryMetricas = supabase.from('metricas').delete();
      if (id) queryMetricas = queryMetricas.eq('ModeloId', id);

      if (error) {
        return NextResponse.json({ error: 'Error al eliminar las metricas del modelo' }, { status: 400 });
      }

     let queryLogs = supabase.from('logs').delete();
      if (id) queryLogs = queryLogs.eq('ModeloId', id);
  
      if (error) {
        return NextResponse.json({ error: 'Error al eliminar los logs del modelo' }, { status: 400 });
      }
  
      return NextResponse.json({ message: 'Modelo y datos asociados eliminados con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el DELETE de modelos:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }