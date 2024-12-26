import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '../../lib/supabaseClient'

import { Modelo } from '../../types/modelos'
import { createClient } from '@supabase/supabase-js';
import { Log } from '@/app/types/logs';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
// const supabase = createClient(supabaseUrl, supabaseKey)


//El GET puede devolver todos los logs, un log específico, o todos los logs de un modelo en concreto.
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const modeloId=searchParams.get('modeloId');
      

      let query = supabase.from('logs').select('*');
  
      if (id) query = query.eq('id', id);
      if (modeloId) query = query.eq('modeloId', modeloId);
      
      
      const { data, error } = await query;
  
      console.info(data)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      
      if (!data || data.length === 0) {
        return NextResponse.json({ message: 'No se encontraron logs correspondientes.' }, { status: 404 });
      }
  
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error('Error en la API:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

//El POST comprueba que exista el modelo correspondiente antes de crear el registro del log. No puedes crear logs sin un modelo asociado.

export async function POST(req: NextRequest) {
    try {
      
      const body = await req.json();
  
      
      const { modeloId, accion, detalle, fechaAccion }: Partial<Log> = body;
  
       
      
      if (!modeloId || !accion || !detalle || !fechaAccion) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }

      let query = supabase.from('modelos').select('*');
      if (modeloId) query = query.eq('id', modeloId);
      const { data: modelos, error: modelosError } = await query;
  
      if (modelosError) {
        return NextResponse.json({ error: modelosError.message }, { status: 400 });
      }
  
      if (!modelos || modelos.length === 0) {
        return NextResponse.json({ error: 'Modelo no encontrado. No puedes crear logs sin un modelo asignado' }, { status: 404 });
      }
  
  
      
      const { data, error } = await supabase
        .from('logs')
        .insert([{ modeloId, accion, detalle, fechaAccion }])
        .select('*')
        .single();
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  

      return NextResponse.json({ message: 'Log creado con éxito', data }, { status: 201 });
    } catch (error) {
      console.error('Error en el POST de logs:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }


//Este DELETE permite borrar un log especifico por Id, o todos los logs de un modelo especificado soin borrar el propio modelo
  export async function DELETE(req: NextRequest) {
    try {
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const modeloId = searchParams.get('modeloId');
  
      
      if (!id) {
        return NextResponse.json(
          { error: 'Se requiere id para eliminar un log específico.' },
          { status: 400 }
        );
      }
  
      if (!modeloId) {
        return NextResponse.json(
          { error: 'Se requiere el id del modelo para eliminar sus logs.' },
          { status: 400 }
        );
      }

      
      let query = supabase.from('logs').delete();
      if (id) query = query.eq('id', id);
      if (modeloId) query = query.eq('modeloId', modeloId);
  
      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: 'Error al eliminar los logs: ' + error.message }, { status: 400 });
      }
      
      return NextResponse.json({ message: 'Log(s) eliminada(s) con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el DELETE de logs:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }