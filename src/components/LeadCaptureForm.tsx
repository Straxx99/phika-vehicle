'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormData } from '../lib/validations'
import { supabase } from '../lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LeadCaptureForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema)
  })

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Generate verification token for email
      const verificationToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

      // Insert lead into database and get the ID back
      const { data: lead, error: dbError } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          vehicle_make: data.vehicleMake,
          lead_status: 'unverified',
          email_verified: false,
          phone_verified: false,
          email_verification_token: verificationToken,
          email_verification_token_expires: expiresAt.toISOString()
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Send verification email
      const emailResponse = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          token: verificationToken
        })
      })

      if (!emailResponse.ok) {
        throw new Error('Failed to send verification email')
      }

      // Redirect to phone verification page
      router.push(`/verify-phone?leadId=${lead.id}&phone=${encodeURIComponent(data.phone)}`)

    } catch (error: unknown) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F1C141] focus:border-transparent"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-300">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F1C141] focus:border-transparent"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F1C141] focus:border-transparent"
            placeholder="0821234567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-300">{errors.phone.message}</p>
          )}
        </div>

        {/* Vehicle Make Field */}
        <div>
          <label htmlFor="vehicleMake" className="block text-sm font-medium text-white mb-2">
            Vehicle Make *
          </label>
          <input
            type="text"
            id="vehicleMake"
            {...register('vehicleMake')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F1C141] focus:border-transparent"
            placeholder="e.g., Toyota, BMW, Mercedes-Benz"
          />
          {errors.vehicleMake && (
            <p className="mt-1 text-sm text-red-300">{errors.vehicleMake.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-[#F1C141] hover:bg-[#F1C141]/90 text-[#3D2966] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Get My Vehicle Value'}
        </button>

        {/* Error Message */}
        {submitError && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">
              ❌ {submitError}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}