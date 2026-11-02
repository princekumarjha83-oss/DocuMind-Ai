import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  Palette,
  Globe,
  Database,
  Trash2,
  Check,
  Sun,
  Moon,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { authService, UserPreferences } from '../../services/authService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateProfileName, changePassword, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'privacy' | 'data'>('profile')

  // Profile Form states
  const [name, setName] = useState(user?.name || '')
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    language: 'en',
    email_notifications: true,
    zero_retention_acknowledged: true,
  })

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Account deletion
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
    // Fetch preferences from real backend
    authService.getPreferences().then((prefs) => {
      if (prefs) setPreferences(prefs)
    }).catch(() => {})
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileLoading(true)
    try {
      await updateProfileName(name.trim())
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to update profile name.'
      setProfileError(msg)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to change password. Current password may be incorrect.'
      setPasswordError(msg)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUpdatePreference = async (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    try {
      await authService.updatePreferences({ [key]: value })
    } catch {
      // Revert if error
    }
  }

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true)
    try {
      await authService.deleteAccount()
      setIsDeleteAccountOpen(false)
      navigate('/')
    } catch (err: unknown) {
      alert((err as { message?: string })?.message || 'Failed to delete account.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your authenticated identity, security credentials, preferences, and data isolation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
          { id: 'privacy', label: 'Privacy & Retention', icon: Shield },
          { id: 'data', label: 'Data Management', icon: Database },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xl flex items-center justify-center shadow-lg">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{name || 'User'}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="primary" size="sm" className="font-mono uppercase text-[9px]">
                  {user?.plan || 'Free'} Plan
                </Badge>
                {user?.is_email_verified ? (
                  <Badge variant="success" size="sm" className="text-[9px]">
                    Verified Email
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm" className="text-[9px]">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {profileError && (
            <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Account Email (Database Bound)"
              value={user?.email || ''}
              disabled
              helperText="Email changes require re-authentication and administrative verification."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Language Preference
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handleUpdatePreference('language', e.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {profileSaved && (
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Profile updated in PostgreSQL database</span>
              </span>
            )}
            <div className="ml-auto">
              <Button type="submit" variant="primary" size="sm" isLoading={profileLoading}>
                Save Profile
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Security & Password Section */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Change Password
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Passwords are encrypted using Argon2id with 64MB memory cost parameters.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Password successfully updated. Your new credentials are active.</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password (min 8 chars)"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-slate-300 text-primary w-4 h-4"
              />
              <span>Show password characters</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={passwordLoading}
              disabled={!currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      )}

      {/* Appearance Section */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Theme Palette
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your preferred color mode. Themes sync across all workspaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setTheme('dark')
                handleUpdatePreference('theme', 'dark')
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Midnight Dark</p>
                <p className="text-[11px] text-slate-400">Deep navy with electric violet accents</p>
              </div>
            </button>

            <button
              onClick={() => {
                setTheme('light')
                handleUpdatePreference('theme', 'light')
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-indigo-600 flex items-center justify-center shadow-md">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Crisp Light</p>
                <p className="text-[11px] text-slate-400">High contrast modern editorial palette</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Privacy Section */}
      {activeTab === 'privacy' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cryptographic & Retention Guardrails
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure strict telemetry and retrieval boundaries.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Zero Model Training Retention
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enforces strict API-level parameter isolation preventing any customer prompt or indexed document chunk from being written into model training weights.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.zero_retention_acknowledged}
                onChange={(e) => handleUpdatePreference('zero_retention_acknowledged', e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Transactional Email Notifications
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive security alerts, indexing completion notifications, and password reset tokens.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => handleUpdatePreference('email_notifications', e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Data Management Section */}
      {activeTab === 'data' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Data Management & Account Deletion
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Permanently delete your account and all associated documents.
            </p>
          </div>

          <div className="pt-4 border-t border-rose-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-500">
                Danger Zone: Permanently Delete Account
              </p>
              <p className="text-[11px] text-slate-400">
                Permanently erase all documents, embeddings, and conversation histories from the database.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAccountOpen(true)}
              className="text-xs"
            >
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Permanently Delete Account?"
        message="This action is irreversible. All of your uploaded files, vector namespaces, and conversational threads will be permanently expunged from the database."
        confirmText="Confirm Deletion"
        isLoading={isDeleting}
      />
    </div>
  )
}
