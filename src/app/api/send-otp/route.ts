import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabase-server'
import { generateOTP, sendOTP } from '../../../lib/sms'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { leadId, phone } = await request.json()

    if (!leadId || !phone) {
      return NextResponse.json(
        { error: 'Lead ID and phone are required' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // OTP expires in 10 minutes

    // Save OTP to database
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({
        phone_otp: otp,
        phone_otp_expires: expiresAt.toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Database error:', updateError)
      throw updateError
    }

    // Send SMS
    const result = await sendOTP(phone, otp)

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: 'OTP sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}