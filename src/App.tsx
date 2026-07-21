import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './lib/auth'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import UnitPage from './pages/UnitPage'
import LessonPlayerPage from './pages/LessonPlayerPage'
import LessonCompletePage from './pages/LessonCompletePage'
import AIConversationPage from './pages/AIConversationPage'
import ProgressPage from './pages/ProgressPage'
import AssessmentPage from './pages/AssessmentPage'
import VocabBankPage from './pages/VocabBankPage'
import VocabReviewPage from './pages/VocabReviewPage'
import VocabClustersPage from './pages/VocabClustersPage'
import VocabClusterPage from './pages/VocabClusterPage'
import SettingsPage from './pages/SettingsPage'

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
      <Route path="/home" element={<Protected><HomePage /></Protected>} />
      <Route path="/unit/:id" element={<Protected><UnitPage /></Protected>} />
      <Route path="/lesson/:id" element={<Protected><LessonPlayerPage /></Protected>} />
      <Route path="/lesson/:id/complete" element={<Protected><LessonCompletePage /></Protected>} />
      <Route path="/practice/:unitId" element={<Protected><AIConversationPage /></Protected>} />
      <Route path="/progress" element={<Protected><ProgressPage /></Protected>} />
      <Route path="/assessment" element={<Protected><AssessmentPage /></Protected>} />
      <Route path="/vocab" element={<Protected><VocabBankPage /></Protected>} />
      <Route path="/clusters" element={<Protected><VocabClustersPage /></Protected>} />
      <Route path="/clusters/:id" element={<Protected><VocabClusterPage /></Protected>} />
      <Route path="/review" element={<Protected><VocabReviewPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
