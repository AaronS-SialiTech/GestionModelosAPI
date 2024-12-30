import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient'; // Ajusta según tu configuración

// Clave secreta del Webhook desde Clerk Dashboard
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    
    const payload = await req.text();
    const signature = req.headers.get('clerk-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Falta la firma del webhook.' },
        { status: 401 }
      );
    }

    
    const hmac = crypto.createHmac('sha256', CLERK_WEBHOOK_SECRET!);
    hmac.update(payload, 'utf-8');
    const digest = hmac.digest('hex');

    if (signature !== digest) {
      return NextResponse.json(
        { error: 'Firma inválida.' },
        { status: 401 }
      );
    }

    
    const event = JSON.parse(payload);

    if (event.type === 'user.created') {
      const user = event.data;

      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: user.id,
            email: user.email_addresses[0]?.email_address,
            nombre: `${user.first_name} ${user.last_name}`,
            fechaCreacion: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error al registrar usuario:', error);
        return NextResponse.json(
          { error: 'Error al registrar usuario.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Usuario registrado con éxito.', data },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Evento no manejado.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
