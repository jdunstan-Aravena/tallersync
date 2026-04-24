import { Resend } from "resend"

type PurchaseOrderEmailItem = {
  descripcion: string
  cantidad: number
  costoUnitario: number
  subtotal: number
}

type SendPurchaseOrderEmailParams = {
  orderNumber: number
  provider: {
    nombre: string
    email: string
    contactoNombre?: string | null
  }
  localNombre: string
  creadoPorNombre: string
  tecnicoAsignadoNombre?: string | null
  nota?: string | null
  total: number
  items: PurchaseOrderEmailItem[]
}

type SendPurchaseOrderEmailResult =
  | { ok: true }
  | { ok: false; error: string }

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value)
}

function buildEmailHtml({
  orderNumber,
  provider,
  localNombre,
  creadoPorNombre,
  tecnicoAsignadoNombre,
  nota,
  total,
  items,
}: SendPurchaseOrderEmailParams) {
  const contactName = provider.contactoNombre || provider.nombre
  const itemsRows = items
    .map((item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;">${item.descripcion}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:right;">${item.cantidad}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:right;">${formatCurrency(item.costoUnitario)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:right;">${formatCurrency(item.subtotal)}</td>
      </tr>
    `)
    .join("")

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; max-width: 720px; margin: 0 auto; padding: 24px;">
      <p style="margin: 0 0 16px;">Hola ${contactName},</p>
      <p style="margin: 0 0 16px;">
        Te compartimos la orden de compra <strong>OC-${String(orderNumber).padStart(4, "0")}</strong> generada desde TallerSync para el local <strong>${localNombre}</strong>.
      </p>

      <div style="background: #F8F8F7; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>Creada por:</strong> ${creadoPorNombre}</p>
        <p style="margin: 0 0 8px;"><strong>Técnico asignado:</strong> ${tecnicoAsignadoNombre ?? "Sin asignar"}</p>
        <p style="margin: 0;"><strong>Total estimado:</strong> ${formatCurrency(total)}</p>
      </div>

      <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="text-align:left; padding: 0 0 12px; border-bottom: 2px solid #D1D5DB;">Item</th>
            <th style="text-align:right; padding: 0 0 12px; border-bottom: 2px solid #D1D5DB;">Cantidad</th>
            <th style="text-align:right; padding: 0 0 12px; border-bottom: 2px solid #D1D5DB;">Costo unitario</th>
            <th style="text-align:right; padding: 0 0 12px; border-bottom: 2px solid #D1D5DB;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${nota ? `
        <div style="background: #E6F1FB; border: 1px solid #B5D4F4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px;"><strong>Nota interna</strong></p>
          <p style="margin: 0;">${nota}</p>
        </div>
      ` : ""}

      <p style="margin: 0 0 8px;">Quedamos atentos a tu confirmación y plazo estimado de entrega.</p>
      <p style="margin: 0;">Saludos,<br />${creadoPorNombre}<br />TallerSync</p>
    </div>
  `
}

function buildEmailText({
  orderNumber,
  provider,
  localNombre,
  creadoPorNombre,
  tecnicoAsignadoNombre,
  nota,
  total,
  items,
}: SendPurchaseOrderEmailParams) {
  const contactName = provider.contactoNombre || provider.nombre
  const lines = items.map((item) => {
    return `- ${item.descripcion}: ${item.cantidad} x ${formatCurrency(item.costoUnitario)} = ${formatCurrency(item.subtotal)}`
  })

  return [
    `Hola ${contactName},`,
    "",
    `Te compartimos la orden de compra OC-${String(orderNumber).padStart(4, "0")} para el local ${localNombre}.`,
    `Creada por: ${creadoPorNombre}`,
    `Técnico asignado: ${tecnicoAsignadoNombre ?? "Sin asignar"}`,
    `Total estimado: ${formatCurrency(total)}`,
    "",
    "Items:",
    ...lines,
    nota ? "" : null,
    nota ? `Nota interna: ${nota}` : null,
    "",
    "Quedamos atentos a tu confirmación y plazo estimado de entrega.",
    `Saludos, ${creadoPorNombre} - TallerSync`,
  ].filter(Boolean).join("\n")
}

export function getPurchaseOrderEmailConfigError() {
  if (!process.env.RESEND_API_KEY) {
    return "Falta configurar RESEND_API_KEY para enviar correos a proveedores."
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    return "Falta configurar RESEND_FROM_EMAIL para enviar correos a proveedores."
  }

  return null
}

export async function sendPurchaseOrderEmail(
  params: SendPurchaseOrderEmailParams
): Promise<SendPurchaseOrderEmailResult> {
  const configError = getPurchaseOrderEmailConfigError()

  if (configError) {
    return { ok: false, error: configError }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: params.provider.email,
      subject: `Orden de compra OC-${String(params.orderNumber).padStart(4, "0")} · ${params.localNombre}`,
      html: buildEmailHtml(params),
      text: buildEmailText(params),
    })

    return { ok: true }
  } catch (error) {
    console.error("Error enviando correo de OC al proveedor:", error)
    return {
      ok: false,
      error: "No pudimos enviar el correo al proveedor en este momento.",
    }
  }
}
