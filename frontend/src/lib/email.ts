import { Resend } from 'resend';

// We use process.env.RESEND_API_KEY. For development it's fine if it's missing, we just log.
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendInvoiceEmail(to: string, invoicePdfBuffer: Buffer, orderNumber: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email Dummy] Sending invoice to', to, 'for order', orderNumber);
    return { success: true, message: 'Dummy email sent (No API key)' };
  }

  try {
    const data = await resend.emails.send({
      from: 'B2B Marketplace <onboarding@resend.dev>', // Update with verified domain
      to: [to],
      subject: `Your Invoice for Order ${orderNumber}`,
      html: `<p>Thank you for your order. Please find your invoice attached.</p>`,
      attachments: [
        {
          filename: `${orderNumber}.pdf`,
          content: invoicePdfBuffer
        }
      ]
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send email', error);
    return { success: false, error: error.message };
  }
}
