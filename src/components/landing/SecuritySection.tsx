import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, KeyRound, Server, FileCheck, EyeOff } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: EyeOff,
      title: 'Zero Model Training Retention',
      description: 'Your documents, embeddings, and queries are never used to train or fine-tune public foundation models under commercial enterprise terms.',
    },
    {
      icon: Lock,
      title: 'AES-256 Envelope Encryption',
      description: 'All document chunks and vector representations are encrypted at rest using AES-GCM-256 with tenant-dedicated KMS customer-managed keys.',
    },
    {
      icon: KeyRound,
      title: 'Tenant Vector Isolation',
      description: 'Strict logical and cryptographic namespace partitions guarantee that semantic searches never scan outside an organization\'s boundary.',
    },
    {
      icon: Server,
      title: 'Strict In-Transit TLS 1.3',
      description: 'End-to-end transport layer security with HSTS preloading prevents eavesdropping and tampering during uploads and retrieval.',
    },
    {
      icon: FileCheck,
      title: 'Granular Role-Based Access Control',
      description: 'Define per-collection viewer, editor, and admin permissions. Revoke document access immediately without rebuilding vector indexes.',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Compliance Alignment',
      description: 'Designed from day one to conform with SOC 2 Type II, GDPR data residency, and HIPAA technical safeguard requirements.',
    },
  ]

  return (
    <section id="security" className="py-24 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            Enterprise Grade Trust
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security built into every vector
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Confidential contracts, proprietary financials, and sensitive IP belong strictly to you. Here is how we enforce ironclad boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {securityPillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card hover className="h-full p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

