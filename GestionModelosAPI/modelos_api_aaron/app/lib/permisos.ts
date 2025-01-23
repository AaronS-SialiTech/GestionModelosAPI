import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "./supabaseClient";
import { Usuario } from "../types/usuarios";
import { RequestLike } from "@clerk/nextjs/dist/types/server/types";

export interface UserPermissions {
  Id: string;
  
}

export async function getUserAndPermissions(request: Request): Promise<Usuario> {
  // Obtener el userId del usuario autenticado
  const authData = getAuth(request as RequestLike);
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

  if (!data || data.length === 0) {
    throw new Error("Usuario no loggeado");
  }

  const user : Usuario = data[0] as Usuario; 



  return user;
    
  
}


export async function hasPermission(permission: string[], req: Request): Promise<boolean> {
  const user = await getUserAndPermissions(req);

  return permission.includes(user.role) || permission.includes('*');
}