import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';

import { supabase } from '../../../lib/supabaseClient';

const secret= process.env.SVIX_API_KEY || 'whsec_FTaxDc99xipr6m4Cc6uvFrWJAqPfepxr'

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


    const event = JSON.parse(body);
    event

    
    if (event.type === 'user.created') {
      

      const datos=event.data;
      console.info('----------------POST-------------------------')
      var nombre=(datos.first_name);
      const email=datos.email_addresses[0].email_address;
      const clerkId=datos.id;
      const fechaCreacion=new Date().toISOString();
      if (!nombre) {
        console.error('Error al asignar nombre de usuario. Se asignará un nombre genérico.');
        nombre = 'Usuario sin nombre';
      }
      try {

      const { data, error } = await supabase
              .from('usuarios')
              .insert([{nombre,email,fechaCreacion, clerkId }])
              .select('*')
              .single();
        
            
            if (error) {
              console.error('Error 400 en el POST de usuarios:', error);
              return NextResponse.json({ error: error.message }, { status: 400 });
            }
        
            
            return NextResponse.json({ message: 'Usuario creado con éxito', data }, { status: 201 });
          } catch (error) {
            console.error('Error 500 en el POST de usuarios:', error);
            return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
          }

     }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
