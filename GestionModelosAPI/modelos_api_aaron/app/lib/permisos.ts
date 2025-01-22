import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "./supabaseClient";
import { Usuario } from "../types/usuarios";

export interface UserPermissions {
  Id: string;
  
}

export async function getUserAndPermissions(request: Request): Promise<Usuario> {
  // Obtener el userId del usuario autenticado
  const authData = getAuth(request);
  //console.info("Auth Data:", authData);

  const { userId } = authData;

  if (!userId) {
    throw new Error("No autorizado: Usuario no autenticado");
  }
  //console.info("userId:", userId);
  // Consultar los permisos del usuario en la base de datos
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("clerkId", userId)
    

  if (error ) {
    throw new Error("Permisos no encontrados");
  }
  const user= data as Usuario;

console.info('role:', user.role);
  return user;
    
  
}
