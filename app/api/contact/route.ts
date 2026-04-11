import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    name:    z.string().min(1),
    email:   z.string().email(),
    subject: z.string().min(1),
    message: z.string().min(10),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const d = schema.parse(body)

        const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:620px;margin:40px auto;padding:0 20px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency — Contact</span>
        </div>
        <h1 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 6px;">Nouveau message</h1>
        <p style="color:#4a4744;font-size:12px;margin:0 0 28px;">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
        <table style="width:100%;border-collapse:collapse;background:#191714;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 14px;font-weight:600;color:#8a8580;font-size:13px;border-bottom:1px solid #1f1d1a;white-space:nowrap;">Nom</td><td style="padding:10px 14px;color:#e8e4dc;font-size:13px;border-bottom:1px solid #1f1d1a;">${d.name}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#8a8580;font-size:13px;border-bottom:1px solid #1f1d1a;white-space:nowrap;">Email</td><td style="padding:10px 14px;color:#e8e4dc;font-size:13px;border-bottom:1px solid #1f1d1a;">${d.email}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#8a8580;font-size:13px;border-bottom:1px solid #1f1d1a;white-space:nowrap;">Sujet</td><td style="padding:10px 14px;color:#e8e4dc;font-size:13px;border-bottom:1px solid #1f1d1a;">${d.subject}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#8a8580;font-size:13px;vertical-align:top;">Message</td><td style="padding:10px 14px;color:#e8e4dc;font-size:13px;white-space:pre-wrap;line-height:1.6;">${d.message}</td></tr>
        </table>
        <p style="color:#2a2825;font-size:11px;margin-top:28px;">2960 Agency — formulaire de contact</p>
      </div></body></html>
    `

        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY!,
            },
            body: JSON.stringify({
                sender:      { name: '2960 Agency', email: 'contact@2960agency.com' },
                to:          [{ email: process.env.NOTIFY_EMAIL || 'contact@2960agency.com' }],
                replyTo:     { email: d.email, name: d.name },
                subject:     `[Contact] ${d.subject} — ${d.name}`,
                htmlContent: html,
            }),
        })

        if (!res.ok) {
            const err = await res.text()
            console.error('Brevo contact error:', err)
            return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error' }, { status: 400 })
        }
        console.error('Contact route error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
