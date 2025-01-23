import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';
import { Usuario } from '@/app/types/usuarios';
import { useAuth } from "@clerk/nextjs";
import { supabase } from '../../../lib/supabaseClient';
import { createClerkClient } from '@clerk/backend'
import { assignRole, getSupabaseUser } from './utils';

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
    console.info('----------------PUT------------------')
    if (event.type === 'user.updated') {
      const datos=event.data;
      
      const userId=datos.id;
      //Esto queda así, vacío, a vista de que expandamos la tabla usuarios y veamos qué campos nos interesan, porque ahora mismo actualizar no hay nada que actualizar en usuarios.
      console.info('clerkId: ', userId);
      const verifyQuery = await supabase.from('usuarios').select('nombre').eq('clerkId', userId);
      var {data: verifyData, error: verifyError} = await verifyQuery;
      if (verifyData === null || verifyData.length === 0) {
        console.error(verifyError);
        return new NextResponse('User not found', { status: 404 });
      } 
        const supabaseUser = await getSupabaseUser(userId);
        if (await assignRole(userId) === false) {
          return new NextResponse('User not found', { status: 404 });
        }
        const nombre = datos.firstName;
        const user = await clerkClient.users.getUser(userId as string);
        let query = supabase.from('usuarios').update({ nombre: nombre, email: user.emailAddresses[0].emailAddress }).eq('clerkId', user.id);
        const { data:userData, error:userError } = await query;

        if (userData === null) {
                console.error(userError);
                return new NextResponse('User not found', { status: 404 });
              } 
        return new NextResponse('User updated successfully',{status: 200});
    }
    if (event.type === 'organizationMembership.updated') {
      const userId=event.data.public_user_data.user_id
      console.info('datos',userId)
      assignRole(userId)
      console.info('User role updated succesfully')
      return new NextResponse('User role updated successfully',{status: 200});
    }
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }

}
