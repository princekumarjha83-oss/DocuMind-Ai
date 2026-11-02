import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export const FinalCta: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow atmospheric light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-dark-bg/90 backdrop-blur-2xl p-8 sm:p-14 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready in under 2 minutes</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Your documents have answers. Start uncovering them now.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Drop your first PDF or technical document into DocuMind AI and experience evidence-backed retrieval with zero hallucinations.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base px-8 h-12 shadow-xl shadow-primary/25"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Exploring Free
              </Button>
            </Link>
            <Link to="/app" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 h-12"
              >
                Explore Live Workspace
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant vector indexing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero data retention policy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

