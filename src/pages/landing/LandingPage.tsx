import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, FileText, Cpu, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Hero3D } from '../../components/landing/Hero3D'
import { CapabilitiesSection } from '../../components/landing/CapabilitiesSection'
import { FeatureGrid } from '../../components/landing/FeatureGrid'
import { HowItWorks } from '../../components/landing/HowItWorks'
import { InteractiveDemo } from '../../components/landing/InteractiveDemo'
import { MultiDocSection } from '../../components/landing/MultiDocSection'
import { EvidenceVerification } from '../../components/landing/EvidenceVerification'
import { SecuritySection } from '../../components/landing/SecuritySection'
import { PricingSection } from '../../components/landing/PricingSection'
import { FaqSection } from '../../components/landing/FaqSection'
import { FinalCta } from '../../components/landing/FinalCta'
import { Footer } from '../../components/layout/Footer'
import { Button } from '../../components/ui/Button'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-slate-100 selection:bg-primary/25 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Subtle radial background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-primary/15 via-accent/10 to-transparent blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Document Intelligence & RAG</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
              >
                Your Documents Have Answers.
              </motion.h1>

              {/* Supporting Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Upload your files, ask anything, and discover the insights hidden inside your documents — powered by intelligent retrieval and AI.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
              >
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-xl shadow-primary/25 h-12 px-7 text-sm font-semibold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Start Exploring
                  </Button>
                </Link>
                <Link to="/app" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-7 text-sm font-semibold"
                  >
                    Explore the Platform
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Interactive page citations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Multi-document synthesis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero data retention</span>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Column: 3D Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-6 relative flex items-center justify-center"
            >
              <Hero3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social-proof Capabilities */}
      <CapabilitiesSection />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* How it Works */}
      <HowItWorks />

      {/* Interactive Chat & Evidence Demo */}
      <InteractiveDemo />

      {/* Multi-Document Intelligence Section */}
      <MultiDocSection />

      {/* Evidence Verification Section */}
      <EvidenceVerification />

      {/* Enterprise Security Section */}
      <SecuritySection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Final Call to Action */}
      <FinalCta />

      {/* Footer */}
      <Footer />
    </div>
  )
}

