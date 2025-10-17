const apiToken = process.env.WHATSMS_API_TOKEN!
const deviceId = process.env.WHATSMS_DEVICE_ID!

export function generateOTP(): string {
  // Generate random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(phone: string, otp: string) {
  try {
    // Format phone number: remove + and spaces, ensure it starts with country code
    // +27712345678 becomes 27712345678
    // 0712345678 becomes 27712345678
    let formattedPhone = phone.replace(/[\s+]/g, '')
    
    // If starts with 0, replace with 27 (SA country code)
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '27' + formattedPhone.substring(1)
    }
    
    const message = `Your Phik'a verification code is: ${otp}. Valid for 10 minutes.`
    
    // Build API URL with parameters
    const apiUrl = new URL('http://api.whatsms.in/api/sendMessage.php')
    apiUrl.searchParams.append('token', apiToken)
    apiUrl.searchParams.append('deviceId', deviceId)
    apiUrl.searchParams.append('msgType', 'text')
    apiUrl.searchParams.append('message', message)
    apiUrl.searchParams.append('mobile', formattedPhone)
    
    console.log('Sending WhatsApp OTP to:', formattedPhone)
    
    const response = await fetch(apiUrl.toString())
    const data = await response.json()
    
    console.log('WhatSMS response:', data)
    
    if (data.status === 'SUCCESS') {
      return { success: true, messageId: data.resText || 'whatsms-sent' }
    } else {
      console.error('WhatSMS error:', data.resText)
      return { success: false, error: data.resText }
    }
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return { success: false, error }
  }
}