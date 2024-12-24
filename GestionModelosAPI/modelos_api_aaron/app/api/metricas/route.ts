import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next'


import { Modelo } from '../../types/modelos'
import { createClient } from '@supabase/supabase-js';
import { Metrica } from '@/app/types/metricas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mggjezyornwukapxeuoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2plenlvcm53dWthcHhldW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MjQ0NiwiZXhwIjoyMDUwMjU4NDQ2fQ.WSaXph9ZB1jJ2nfpzhvpPnlpMpw0XVipm3Q3SVMMM8I';
const supabase = createClient(supabaseUrl, supabaseKey)

//El GET puede devolver todas las metricas, una métrica específica, o todas las metricas de un modelo en concreto.

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const modeloId=searchParams.get('modeloId');
      

      let query = supabase.from('metricas').select('*');
  
      if (id) query = query.eq('id', id);
      if (modeloId) query = query.eq('modeloId', modeloId);
      

      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      
      if (!data || data.length === 0) {
        return NextResponse.json({ message: 'No se encontraron metricas correspondientes.' }, { status: 404 });
      }
  
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error('Error en la API:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

//El POST comprueba que exista el modelo correspondiente antes de crear el registro de la metrica. No puedes crear metricas sin un modelo asociado.

export async function POST(req: NextRequest) {
    try {
      
      const body = await req.json();
  
      
      const { modeloId, precision, recall, f1_score, fechaEvaluacion }: Partial<Metrica> = body;
  
        console.info('modeloId:', modeloId);
        console.info('precision:', precision);
        console.info('recall:', recall);
        console.info('f1_score:', f1_score);
        console.info('fechaEvaluacion:', fechaEvaluacion);
      
      if (!modeloId || !precision || !recall || !f1_score || !fechaEvaluacion) {
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
        return NextResponse.json({ error: 'Modelo no encontrado. No puedes crear metricas sin un modelo asignado' }, { status: 404 });
      }
  
  
      
      const { data, error } = await supabase
        .from('metricas')
        .insert([{ modeloId, precision, recall, f1_score, fechaEvaluacion }])
        .select('*')
        .single();
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  

      return NextResponse.json({ message: 'Metrica creado con éxito', data }, { status: 201 });
    } catch (error) {
      console.error('Error en el POST de metricas:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }


//Este DELETE permite borrar una métrica especifica por Id, o todas las metricas de un modelo especificado sin borrar el propio modelo
  export async function DELETE(req: NextRequest) {
    try {
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const modeloId = searchParams.get('modeloId');
  
      
      if (!id) {
        return NextResponse.json(
          { error: 'Se requiere id para eliminar una metrica específica.' },
          { status: 400 }
        );
      }
  
      if (!modeloId) {
        return NextResponse.json(
          { error: 'Se requiere el id del modelo para eliminar sus metricas.' },
          { status: 400 }
        );
      }

      
      let query = supabase.from('metricas').delete();
      if (id) query = query.eq('id', id);
      if (modeloId) query = query.eq('modeloId', modeloId);
  
      const { data, error } = await query;
  
      if (error) {
        return NextResponse.json({ error: 'Error al eliminar la(s) metrica(s): ' + error.message }, { status: 400 });
      }
      
      return NextResponse.json({ message: 'Metrica(s) eliminada(s) con éxito', data }, { status: 200 });
    } catch (error) {
      console.error('Error en el DELETE de metricas:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }