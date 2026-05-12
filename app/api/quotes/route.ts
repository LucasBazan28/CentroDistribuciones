import { NextResponse } from "next/server";
import { Resend } from 'resend';

interface QuoteRequest {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  items: Array<{
    id: number;
    referencia: string;
    descripcion: string;
    precio_venta: number;
    quantity: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();

    // Validate required fields
    if (!body.nombre || !body.email || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total
    const total = body.items.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);

    // Prepare email content
    const emailContent = `
Nuevo Presupuesto Solicitado
============================

Cliente: ${body.nombre}
Email: ${body.email}
Teléfono: ${body.telefono || "No proporcionado"}

Artículos:
----------
${body.items
  .map(
    (item) =>
      `- ${item.referencia} (${item.descripcion})\n  Cantidad: ${item.quantity}\n  Precio unitario: $${item.precio_venta.toLocaleString("es-CO")}\n  Subtotal: $${(item.precio_venta * item.quantity).toLocaleString("es-CO")}`
  )
  .join("\n\n")}

Total: $${total.toLocaleString("es-CO")}

Mensaje del cliente:
${body.mensaje || "Sin mensaje adicional"}

---
Timestamp: ${new Date().toISOString()}
    `.trim();

    // For now, log the quote (in production, you would send an email)
    console.log("Quote Request:", {
      timestamp: new Date().toISOString(),
      customer: body.nombre,
      email: body.email,
      itemsCount: body.items.length,
      total: total,
    });

    // TODO: Integrate with email service (SendGrid, Resend, AWS SES, etc.)
    // Example with Resend (uncomment if using):

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: 'noreply@centrodistribuciones.com.ar',
      to: 'lucasbazancastaing1@gmail.com', //disribucionzoloda.bb@gmail.com
      replyTo: body.email,
      subject: `Nuevo Presupuesto - ${body.nombre}`,
      text: emailContent,
      html: `<pre>${emailContent}</pre>`,
    });


    // For now, just log and return success
    console.log("Email content would be sent to: ventas@centrodistribuciones.com.ar");
    console.log(emailContent);

    return NextResponse.json(
      {
        success: true,
        message: "Presupuesto enviado exitosamente",
        quote_id: `QUOTE-${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
