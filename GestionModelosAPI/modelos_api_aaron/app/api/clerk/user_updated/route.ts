import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';

import { useAuth } from "@clerk/nextjs";
import { supabase } from '../../../lib/supabaseClient';
import { createClerkClient } from '@clerk/backend'

const CLERK_SECRET_KEY='sk_test_cV8tQDJU1mtkYiRojQaUcPITVctKwOjfCp1oZoxgdG'
const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY })
const secret= process.env.SVIX_API_KEY || 'whsec_OTYV71o39JlillLZo/U4bJsdTgKftx86'


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
    
    if (event.type === 'user.updated') {
      const datos=event.data;
      console.info('----------------PUT------------------')
      //Esto queda así, vacío, a vista de que expandamos la tabla usuarios y veamos qué campos nos interesan, porque ahora mismo actualizar no hay nada que actualizar en usuarios.

      const userId=datos.id
      const nombre=datos.firstName;
      
      const id=userId;
      const orgId=process.env.CLERK_ID_ORGANIZACION as string;
      const org= await clerkClient.organizations.getOrganizationMembershipList({organizationId: orgId as string });
      const search=org.data.find(userData => userData.publicUserData?.userId == id)
        if(search!=null){
          const role = search.role
          const user = await clerkClient.users.getUser(userId as string);
          let query = supabase.from('usuarios').update({ role: role.split(':')[1], nombre: nombre, email: user.emailAddresses[0].emailAddress }).eq('clerkId', user.id);
          const { data, error } = await query;
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
          return NextResponse.json({ message: 'Usuario actualizado con éxito', data }, { status: 200 });
            }
          }
    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}