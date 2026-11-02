import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Starter Community',
      badge: 'Free Forever',
      price: '$0',
      period: 'forever',
      description: 'Ideal for researchers, students, and individual document exploration.',
      features: [
        'Up to 15 documents per month',
        'Max 25MB file size limit',
        'PDF, DOCX, TXT support',
        'Standard BM25 + dense search',
        'Single document chat sessions',
        'Community Discord support',
      ],
      limitations: [
        'Multi-document synthesis unavailable',
        'Cross-encoder reranking unavailable',
      ],
      cta: 'Get Started Free',
      ctaVariant: 'outline' as const,
      highlight: false,
    },
    {
      name: 'Professional',
      badge: 'Most Popular',
      price: billingCycle === 'monthly' ? '$29' : '$24',
      period: 'per month',
      description: 'Engineered for founders, analysts, legal counsel, and engineers.',
      features: [
        'Up to 250 documents per month',
        'Max 50MB file size limit',
        'All 6 formats (PDF, DOCX, CSV, PPTX, MD, TXT)',
        'Hybrid sparse + dense vector ranking',
        'Cross-document synthesis (up to 20 files)',
        'Interactive citation highlights with page view',
        'Custom workspace collections',
        'Priority vector indexing queue',
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      ctaVariant: 'primary' as const,
      highlight: true,
    },
    {
      name: 'Enterprise Team',
      badge: 'Custom Governance',
      price: billingCycle === 'monthly' ? '$99' : '$79',
      period: 'per user / month',
      description: 'For organizations demanding custom security, SLA, and SSO.',
      features: [
        'Unlimited document volume',
        'Max 250MB file size limit',
        'Dedicated isolated vector namespace',
        'Customer-managed KMS encryption keys',
        'SAML 2.0 / Okta / Azure AD SSO',
        'Custom fine-tuned cross-encoders',
        'Granular role-based team permissions',
        '99.9% Uptime SLA & Dedicated support',
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaVariant: 'outline' as const,
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-4">
            Illustrative Pricing Structure
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparent plans for every document workload
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Start free, explore capabilities, and scale when your team demands deeper cross-synthesis.
          </p>

          <p className="mt-2 text-xs text-amber-500 font-mono">
            [Notice: Tier quotas and rates are illustrative UI representations. Payment gateway connects in a later stage.]
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex"
            >
              <Card
                className={`w-full p-8 flex flex-col justify-between relative rounded-3xl ${
                  plan.highlight
                    ? 'border-2 border-primary shadow-2xl shadow-primary/10 bg-white dark:bg-slate-900'
                    : 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-md shadow-primary/25">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {!plan.highlight && (
                      <span className="text-xs font-medium text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400">/{plan.period}</span>
                  </div>

                  <div className="mt-8 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Included Capabilities
                    </p>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {plan.limitations.map((lim) => (
                      <div key={lim} className="flex items-start gap-2.5 text-xs text-slate-400 line-through opacity-70">
                        <span className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">✕</span>
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link to="/signup" className="block w-full">
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full justify-center"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

