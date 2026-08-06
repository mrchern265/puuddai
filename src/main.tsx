import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { supabaseConfigured } from './lib/supabase'

function ConfigError() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🔧</span>
      <h1 className="text-xl font-bold text-brand">ยังตั้งค่าเซิร์ฟเวอร์ไม่ครบ</h1>
      <p className="text-sm text-slate-600">
        แอปโหลดขึ้นแล้ว แต่ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล
        (ตัวแปร <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>)
        บนตัว deploy ครับ
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {supabaseConfigured ? (
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      ) : (
        <ConfigError />
      )}
    </ErrorBoundary>
  </StrictMode>,
)
