import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { leadId, otp } = await request.json()

    if (!leadId || !otp) {
      return NextResponse.json(
        { error: 'Lead ID and OTP are required' },
        { status: 400 }
      )
    }

    // Find lead with this OTP
    const { data: lead, error: findError } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('phone_otp', otp)
      .single()

    if (findError || !lead) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    const expiresAt = new Date(lead.phone_otp_expires)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Check if email is also verified to determine lead_status
    const newLeadStatus = lead.email_verified ? 'verified' : 'unverified'

    // Update lead - mark phone as verified
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({
        phone_verified: true,
        lead_status: newLeadStatus,
        phone_otp: null, // Clear OTP
        phone_otp_expires: null
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    const message = newLeadStatus === 'verified'
      ? 'Phone verified! Your account is now fully verified.'
      : 'Phone verified! Please also verify your email to complete registration.'

    return NextResponse.json({
      success: true,
      message,
      isFullyVerified: newLeadStatus === 'verified'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}