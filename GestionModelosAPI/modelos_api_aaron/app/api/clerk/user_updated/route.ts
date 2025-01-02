import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';

import { supabase } from '../../../lib/supabaseClient';

const secret= process.env.SVIX_API_KEY || 'whsec_OTYV71o39JlillLZo/U4bJsdTgKftx86'
// Instanciamos la clase Webhook de Svix
const webhook = new Webhook(secret!);

export async function POST(req: NextRequest) {
  try {
    // Obtén el cuerpo del webhook
    const body = await req.text();
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const headers = {
      "webhook-id": req.headers.get('svix-id')!,
      "webhook-timestamp": req.headers.get('svix-timestamp')!,
      "webhook-signature": req.headers.get('svix-signature')!,
    };

    // Verifica que tengamos la firma y el timestamp
    if (!signature || !timestamp) {
      return new NextResponse('Missing signature or timestamp', { status: 400 });
    }

    // Verifica la firma del webhook usando el método correcto
    try {
      webhook.verify(body, headers); // Verificación de la firma del webhook
    } catch (error) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Procesar el webhook aquí
    const event = JSON.parse(body);
    event

    // Ejemplo de cómo manejar el evento
    if (event.type === 'user.updated') {
      // Realiza una acción cuando se crea un usuario, por ejemplo, actualizar tu base de datos

      const datos=event.data;
      console.info('----------------PUT------------------')
      console.info('datos',datos)
    
        //Esto queda así, vacío, a vista de que expandamos la tabla usuarios y veamos qué campos nos interesan, porque ahora mismo actualizar no hay nada que actualizar en usuarios.SS



    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}