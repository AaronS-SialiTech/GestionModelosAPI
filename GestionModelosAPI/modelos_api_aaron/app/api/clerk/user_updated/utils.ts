
import { Usuario } from '@/app/types/usuarios';
import { supabase } from '../../../lib/supabaseClient';
import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/backend'


const CLERK_SECRET_KEY='sk_test_cV8tQDJU1mtkYiRojQaUcPITVctKwOjfCp1oZoxgdG'
const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY })
const secret= process.env.SVIX_API_KEY || 'whsec_OTYV71o39JlillLZo/U4bJsdTgKftx86'


export async function getSupabaseUser(clerkId:string) {
  const verifyQuery = await supabase.from('usuarios').select('nombre').eq('clerkId', clerkId);
  var { data, error } = await verifyQuery;
  if (data === null || data.length === 0) {
    console.error(error);
    throw new Error('User not found');
  }
  return data[0] as Usuario;
}


export async function assignRole(clerkId:string) {
  const orgId = process.env.CLERK_ID_ORGANIZACION as string;
  try{
    const org = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId as string });
    const search = org.data.find(userData => userData.publicUserData?.userId == clerkId)
    if (search != null) {
        console.info('PERMISOS ACTUALES: ', search.role);
        const role = search.role
        console.info('PERMISOS ACTUALES: ', role);
        let query = supabase.from('usuarios').update({ role: role.split(':')[1] }).eq('clerkId', clerkId);
        const { data, error } = await query;
        if (error) {
        return false;
        }
        return true;
      }
    } catch (error) {
      console.error(error);
      NextResponse.json({ error: 'Error al asignar rol' }, { status: 500 });
    }
    }