import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { validateEmail, evaluatePasswordStrength } from '../../utils/validators'
import { useAuth } from '../../context/AuthContext'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signup, isLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Errors
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [termsError, setTermsError] = useState('')
  const [formError, setFormError] = useState('')

  const strength = evaluatePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmError('')
    setTermsError('')
    setFormError('')

    let hasError = false
    if (!name.trim()) {
      setNameError('Full name is required')
      hasError = true
    }

    if (!email) {
      setEmailError('Email address is required')
      hasError = true
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      hasError = true
    }

    if (!password) {
      setPasswordError('Password is required')
      hasError = true
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      hasError = true
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      hasError = true
    }

    if (!acceptTerms) {
      setTermsError('You must agree to the Terms of Service to create an account')
      hasError = true
    }

    if (hasError) return

    const result = await signup({ name, email, password })
    if (result.success) {
      navigate('/app')
    } else {
      setFormError(result.error || 'Registration failed. Please check your information.')
    }
  }

  return (
    <AuthLayout
      title="Create your DocuMind AI account"
      subtitle="Experience unified document intelligence with verified source citations"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-500 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{formError}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Dr. Sarah Connor"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError('')
          }}
          error={nameError}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="s.connor@organization.com"
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

        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError('')
            }}
            error={passwordError}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="new-password"
            required
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Security strength:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {strength.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full transition-colors ${
                      strength.score >= step ? strength.color : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1">
                <span className={strength.hasMinLength ? 'text-emerald-500 font-medium' : ''}>
                  • 8+ characters
                </span>
                <span className={strength.hasUppercase ? 'text-emerald-500 font-medium' : ''}>
                  • Uppercase letter
                </span>
                <span className={strength.hasNumber ? 'text-emerald-500 font-medium' : ''}>
                  • Number
                </span>
                <span className={strength.hasSpecial ? 'text-emerald-500 font-medium' : ''}>
                  • Special symbol
                </span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (confirmError) setConfirmError('')
          }}
          error={confirmError}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked)
                if (termsError) setTermsError('')
              }}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 w-4 h-4 shrink-0"
            />
            <span>
              I agree to the <a href="#" className="underline text-primary">Terms of Service</a>, <a href="#" className="underline text-primary">Privacy Policy</a>, and understand that my documents are protected with zero model training retention.
            </span>
          </label>
          {termsError && (
            <p className="text-xs text-rose-500 font-medium mt-1">{termsError}</p>
          )}
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center h-11 text-sm font-semibold"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Free Account
          </Button>
        </div>

        <div className="pt-4 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
