import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  LayoutDashboard,
  Files,
  Sparkles,
  FolderKanban,
  History,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDocuments } from '../../context/DocumentContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { documents, collections } = useDocuments()

  const mainNavigation = [
    { name: 'Overview', href: '/app', icon: LayoutDashboard },
    { name: 'AI Workspace', href: '/app/workspace', icon: Sparkles, badge: 'RAG' },
    { name: 'My Documents', href: '/app/documents', icon: Files, count: documents.length },
    { name: 'Collections', href: '/app/collections', icon: FolderKanban, count: collections.length },
    { name: 'Conversations', href: '/app/history', icon: History },
    { name: 'Favorites', href: '/app/documents?filter=favorites', icon: Star },
  ]

  const secondaryNavigation = [
    { name: 'Settings', href: '/app/settings', icon: Settings },
    { name: 'Documentation', href: '/#features', icon: HelpCircle },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col truncate"
              >
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  DocuMind <span className="text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary font-mono">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                  Workspace
                </span>
              </motion.div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick New Workspace Action */}
        {!collapsed ? (
          <div className="px-2 mb-4">
            <Link to="/app/workspace">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-start text-xs font-semibold gap-2 shadow-sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Synthesis Query
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <Link to="/app/workspace">
              <button
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                title="New Query"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}

        {/* Primary Navigation */}
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-primary-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <Badge variant="cyan" size="sm" className="font-mono text-[9px] py-0 px-1.5">
                    {item.badge}
                  </Badge>
                )}
                {!collapsed && item.count !== undefined && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md">
                    {item.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBar"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Collections Shortcut */}
        {!collapsed && collections.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 px-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Collections</span>
              <Link to="/app/collections" className="hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            {collections.slice(0, 3).map((col) => (
              <Link
                key={col.id}
                to={`/app/documents?collection=${col.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 truncate"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                <span className="truncate">{col.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User & Settings Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
        {secondaryNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}

        {/* User Profile Card */}
        <div className={`mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            {!collapsed && (
              <div className="truncate text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'Explorer'}
                  </p>
                  {user?.is_email_verified && (
                    <Badge variant="success" size="sm" className="text-[9px] py-0 px-1">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'preview@documind.ai'}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

