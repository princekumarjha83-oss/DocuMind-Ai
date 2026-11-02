import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { validateEmail } from '../../utils/validators'
import { useAuth } from '../../context/AuthContext'

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setErrorMessage('')

    if (!email) {
      setEmailError('Email address is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      await requestPasswordReset(email)
      setIsSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to dispatch reset request.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your verified email to receive a secure password reset link"
    >
      {isSubmitted ? (
        <div className="space-y-6 text-center sm:text-left">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Password Reset Request Received</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If an account exists for <strong className="text-slate-900 dark:text-white font-mono">{email}</strong>, a secure one-time reset link has been dispatched. Links expire in 30 minutes.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="w-full justify-center text-xs"
            >
              Send another link
            </Button>
            <Link to="/login" className="w-full">
              <Button
                variant="ghost"
                className="w-full justify-center text-xs"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
            error={emailError}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center h-11 text-sm font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
