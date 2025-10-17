'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyPhoneContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const leadId = searchParams.get('leadId')
  const phone = searchParams.get('phone')

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  // Auto-send OTP on page load
  useEffect(() => {
    if (leadId && phone) {
      sendOTP()
    }
  }, [leadId, phone])

  const sendOTP = async () => {
    if (!leadId || !phone) {
      setError('Invalid verification link')
      return
    }

    setIsSending(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, phone })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`OTP sent to ${phone}`)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, otp })
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        setMessage(data.message)
      } else {
        setError(data.error || 'Invalid code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!leadId || !phone) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
        <p className="text-white/90 mb-6">This verification link is invalid.</p>
        <Link href="/" className="inline-block py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white mb-4">Phone Verified!</h1>
        <p className="text-white/90 mb-6">{message}</p>
        <Link href="/" className="inline-block py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors">
          Continue to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">📱</div>
      <h1 className="text-2xl font-bold text-white mb-4">Verify Your Phone</h1>
      <p className="text-white/90 mb-6">
        {isSending ? 'Sending code...' : `Enter the 6-digit code sent to ${phone}`}
      </p>

      <form onSubmit={verifyOTP} className="space-y-6">
        <div>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F1C141] focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {message && (
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <button
          type="button"
          onClick={sendOTP}
          disabled={isSending}
          className="w-full py-2 text-white/80 hover:text-white text-sm underline"
        >
          {isSending ? 'Sending...' : 'Resend Code'}
        </button>
      </form>
    </div>
  )
}

export default function VerifyPhonePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2966] via-[#9C45A2] to-[#F1C141] flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl max-w-md w-full">
        <Suspense fallback={
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        }>
          <VerifyPhoneContent />
        </Suspense>
      </div>
    </div>
  )
}