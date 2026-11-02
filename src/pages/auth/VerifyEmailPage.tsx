import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, RefreshCw } from 'lucide-react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { validateEmail } from '../../utils/validators'

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail, resendVerification } = useAuth()

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(token ? 'verifying' : 'idle')
  const [message, setMessage] = useState<string>('')
  const [resendEmail, setResendEmail] = useState<string>('')
  const [resendLoading, setResendLoading] = useState<boolean>(false)
  const [resendSuccess, setResendSuccess] = useState<boolean>(false)
  const [resendError, setResendError] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('idle')
      return
    }

    let isMounted = true
    verifyEmail(token)
      .then((res) => {
        if (isMounted) {
          setStatus('success')
          setMessage(res.message || 'Your email address has been successfully verified!')
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus('error')
          setMessage(err.message || 'Verification link is invalid, expired, or has already been used.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setResendError('')
    if (!resendEmail || !validateEmail(resendEmail)) {
      setResendError('Please enter a valid email address.')
      return
    }

    setResendLoading(true)
    try {
      await resendVerification(resendEmail)
      setResendSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to dispatch verification email.'
      setResendError(msg)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirm your identity to enable secure document indexing"
    >
      <div className="space-y-6">
        {status === 'verifying' && (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Validating Verification Token...
            </h3>
            <p className="text-xs text-slate-400">
              Verifying cryptographic hash with the database cluster
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Successfully Verified!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {message}
              </p>
            </div>
            <Link to="/app">
              <Button
                variant="primary"
                className="w-full justify-center mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to AI Workspace
              </Button>
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'idle') && (
          <div className="space-y-6">
            {status === 'error' && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-500 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Verification Token Failed</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-6">
                  {message}
                </p>
              </div>
            )}

            {/* Request New Link Form */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Request a new verification link
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered email address to receive a fresh single-use verification email.
                </p>
              </div>

              {resendSuccess ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>If an eligible account exists, a new verification link has been dispatched.</span>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <Input
                    label="Account Email"
                    type="email"
                    placeholder="name@company.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    error={resendError}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-xs h-9"
                    isLoading={resendLoading}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Resend Verification Email
                  </Button>
                </form>
              )}
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-primary font-medium hover:underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

