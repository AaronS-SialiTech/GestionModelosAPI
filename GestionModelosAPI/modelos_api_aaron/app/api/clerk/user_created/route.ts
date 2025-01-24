import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/backend'
import { supabase } from '../../../lib/supabaseClient';
import { getSupabaseUser, deleteUserOnError } from '../utils';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
const secret = process.env.SVIX_API_KEY || 'whsec_FTaxDc99xipr6m4Cc6uvFrWJAqPfepxr'

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
      return new NextResponse('Missing signature or timestamp', { status: 401 });
    }
    try {
      webhook.verify(body, headers); 
    } catch (error) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    if (event.type === 'user.created') {
      
      const datos = event.data;
      console.info('----------------POST-------------------------')
      var nombre = datos.first_name;
      const email = datos.email_addresses[0].email_address;
      const clerkId = datos.id;
      const fechaCreacion = new Date().toISOString();

      if (!nombre) {
        console.error('Error al asignar nombre de usuario. Se asignará un nombre genérico.');
        nombre = 'Usuario sin nombre';
      }
      console.log('TESTING: Datos del usuario')
      console.log({nombre, email, fechaCreacion, clerkId});
      try {
      if (await getSupabaseUser(clerkId)) 
        return NextResponse.json({ error: 'El usuario ya existe en la base de datos' }, { status: 402 });
      
      const { data:insertData, error:insertError } = await supabase
              .from('usuarios')
              .insert([{nombre,email,fechaCreacion, clerkId }])
              .select('*')
              .single();
        
            if (insertError) {
              console.error('Error en el POST de usuarios:', insertError);
              return NextResponse.json({ error: insertError.message }, { status: 422 });
              
            }
          if (insertData == null)
            return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });

            const orgId = process.env.CLERK_ID_ORGANIZACION as string;
            const org = await clerkClient.organizations.getOrganizationMembershipList({organizationId: orgId as string });
            const search = org.data.find(userData => userData.publicUserData?.userId == clerkId)
            
            if(search == null) {
              await deleteUserOnError(clerkId);
              return NextResponse.json({ error: 'El usuario no pertenece a la organización' }, { status: 403 });
            }
            const role=search.role.split(':')[1];
            console.info('PERMISOS CREADOS: ', role);
            const user = await clerkClient.users.getUser(clerkId as string);
            if (!user) {
              await deleteUserOnError(clerkId);
              return NextResponse.json({ error: 'El usuario no existe en clerk' }, { status: 404 });
             }
            let query=supabase.from('usuarios').update({role : role}).eq('clerkId', clerkId);
            const { data, error } = await query;
            if (error) {
              await deleteUserOnError(clerkId);
              return NextResponse.json({ error: error.message }, { status: 422 });
            }
            if((await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId as string })).data.
                find(userData => userData.publicUserData?.userId == clerkId) == null) {
                  await deleteUserOnError(clerkId);
                  return NextResponse.json({ error: 'El usuario no pertenece a la organización' }, { status: 403 });
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
