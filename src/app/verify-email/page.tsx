'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.error === 'expired') {
            setStatus('expired')
            setMessage(data.message)
          } else {
            setStatus('error')
            setMessage(data.error || 'Verification failed')
          }
          return
        }

        setStatus('success')
        setMessage(data.message)

      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2966] via-[#9C45A2] to-[#F1C141] flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-4">Email Verified!</h1>
            <p className="text-white/90 mb-6">{message}</p>
            <Link 
              href="/"
              className="inline-block py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors"
            >
              Continue to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
            <p className="text-white/90 mb-6">{message}</p>
            <Link 
              href="/"
              className="inline-block py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[##3D2966] font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
            <p className="text-white/90 mb-6">{message}</p>
            <Link 
              href="/"
              className="inline-block py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors"
            >
              Request New Link
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}