import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Github, Twitter, Linkedin, ShieldCheck, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-dark-bg/95 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                DocuMind <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Universal Document Intelligence & RAG Workspace. Ingest, index, and query multi-format corporate knowledge with verifiable evidence citations.
            </p>
            <div className="flex items-center gap-4 text-slate-400 pt-2">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </h4>
            <ul className="space-y-2">
              <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/app" className="hover:text-primary transition-colors">AI Workspace</Link></li>
              <li><Link to="/app/documents" className="hover:text-primary transition-colors">Document Library</Link></li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Architecture
            </h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500">Hybrid BM25 + Dense</span></li>
              <li><span className="text-slate-500">Cross-Encoder Reranker</span></li>
              <li><span className="text-slate-500">Structure-Aware Chunking</span></li>
              <li><span className="text-slate-500">Tenant Vector Namespaces</span></li>
              <li><span className="text-slate-500">AES-256 Envelope Keys</span></li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Trust & Legal
            </h4>
            <ul className="space-y-2">
              <li><a href="/#security" className="hover:text-primary transition-colors">Security Whitepaper</a></li>
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
              <li><span className="text-slate-500">Data Processing Addendum</span></li>
              <li><span className="text-slate-500">SOC 2 Compliance Spec</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} DocuMind AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with mathematical precision & zero hallucination tolerance</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

