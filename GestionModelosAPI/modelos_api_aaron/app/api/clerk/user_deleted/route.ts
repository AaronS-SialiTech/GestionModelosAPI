import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '../../../lib/supabaseClient';

import { createClerkClient } from '@clerk/backend'


const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_test_YWJzb2x1dGUtY29yZ2ktMjguY2xlcmsuYWNjb3VudHMuZGV2JA'
const CLERK_SECRET_KEY='sk_test_cV8tQDJU1mtkYiRojQaUcPITVctKwOjfCp1oZoxgdG'
const CLERK_API_URL='https://api.clerk.com'
const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY })

const secret= process.env.SVIX_API_KEY || 'whsec_ok9URzPqiM+GibzsUIUaY8EWhTCdhCqH'

const webhook = new Webhook(secret!);

export async function POST(req: NextRequest) {
  try {
    
    const body = await req.text();
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const headers = {
      "webhook-id": req.headers.get('svix-id')!,
      "webhook-timestamp": req.headers.get('svix-timestamp')!,
      "webhook-signature": req.headers.get('svix-signature')!,
    };

    
    if (!signature || !timestamp) {
      return new NextResponse('Missing signature or timestamp', { status: 400 });
    }

    
    try {
      webhook.verify(body, headers); 
    } catch (error) {
      return new NextResponse('Invalid signature', { status: 400 });
    }
    console.info('Conexion a webhook correcta')
    
    const event = JSON.parse(body);
    event

    
    if (event.type === 'user.deleted') {
      
      console.log('POST Recibido');
      
    
    const datos=event.data;
    console.info('----------------DELETE-------------------------')
    
    const userId=datos.id
    try {
        
        
        console.info('userId:', userId);
        let query = supabase.from('usuarios').delete();
        if (userId) query = query.eq('clerkId', userId);
        const { data, error } = await query;
  
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      return NextResponse.json({ message: 'Usuario eliminado con éxito', data }, { status: 200 });
        
       
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        return new NextResponse('User not found', { status: 404 });
      }




    }
} catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }


}