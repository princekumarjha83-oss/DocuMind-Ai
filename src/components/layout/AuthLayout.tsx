import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Sparkles, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      {/* Left Column: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              DocuMind <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">AI</span>
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        <div className="my-auto py-8 max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span>Protected with AES-256 encryption. By continuing, you agree to our Terms of Service & Privacy Policy.</span>
        </div>
      </div>

      {/* Right Column: Visual Side (Desktop only) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 border-l border-white/5 flex-col justify-between p-16 overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
            Universal RAG Intelligence
          </span>
        </div>

        {/* Centerpiece Floating Cards */}
        <div className="relative z-10 max-w-lg space-y-4 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                Sourced Evidence Verification
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Confidence 99.2%
              </span>
            </div>
            <p className="text-sm font-sans text-slate-200 leading-relaxed">
              "Total revenue for Q3 achieved $48.6M, representing a 28% year-over-year increase driven by strong enterprise subscription adoption."
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Q3_Financial_Analysis_Report.pdf</span>
              <span className="text-primary font-bold">Page 3</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md shadow-xl flex items-center gap-3 text-xs text-slate-300"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>Tenant vector namespaces are strictly isolated with KMS envelope encryption.</span>
          </motion.div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-300 font-medium italic">
            "Your documents. One intelligent workspace."
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Engineered for founders, researchers, and enterprises.
          </p>
        </div>
      </div>
    </div>
  )
}

