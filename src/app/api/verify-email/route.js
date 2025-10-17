import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find lead with this token (using service role - bypasses RLS)
    const { data: lead, error: findError } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('email_verification_token', token)
      .single()

    if (findError || !lead) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 404 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(lead.email_verification_token_expires)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'expired', message: 'This verification link has expired' },
        { status: 400 }
      )
    }

    // Check if phone is also verified to determine lead_status
    const newLeadStatus = lead.phone_verified ? 'verified' : 'unverified'

    // Update lead - mark email as verified
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({
        email_verified: true,
        lead_status: newLeadStatus,
        email_verification_token: null,
        email_verification_token_expires: null
      })
      .eq('id', lead.id)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    const message = newLeadStatus === 'verified'
      ? 'Your email has been verified successfully! Your account is now fully verified.'
      : 'Your email has been verified successfully! Please verify your phone number to complete registration.'

    return NextResponse.json({
      success: true,
      message,
      needsPhoneVerification: !lead.phone_verified
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}