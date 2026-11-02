import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { PricingPage } from '../pages/pricing/PricingPage'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { WorkspacePage } from '../pages/workspace/WorkspacePage'
import { DocumentsPage } from '../pages/documents/DocumentsPage'
import { DocumentDetailPage } from '../pages/documents/DocumentDetailPage'
import { CollectionsPage } from '../pages/collections/CollectionsPage'
import { HistoryPage } from '../pages/history/HistoryPage'
import { SettingsPage } from '../pages/settings/SettingsPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Authenticated Protected Workspace App */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/:id" element={<DocumentDetailPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
