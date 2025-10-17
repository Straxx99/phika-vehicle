import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/verify-email?token=${verificationToken}`

  try {
    const data = await resend.emails.send({
      from: 'Phika Vehicle <onboarding@resend.dev>', // We'll customize this later
      to: email,
      subject: 'Verify your email - Phik\'a Vehicle Protection',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3D2966;">Welcome to Phik'a Vehicle Protection!</h1>
          <p>Thank you for your interest in protecting your vehicle's value.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #F1C141; color: #3D2966; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            Verify Email Address
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            ${verificationUrl}
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}