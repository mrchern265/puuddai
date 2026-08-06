import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

// Top-level safety net. Without this, any thrown error anywhere in the tree
// unmounts everything and the user just sees a blank white screen with no clue
// what happened. Here we catch it and show a readable message instead.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="text-5xl">😵‍💫</span>
          <h1 className="text-xl font-bold text-brand">มีบางอย่างผิดพลาด</h1>
          <p className="text-sm text-slate-600">
            แอปสะดุดชั่วคราว ลองรีเฟรชหน้าอีกครั้งดูนะครับ
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
          >
            รีเฟรชหน้า
          </button>
          <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-500">
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
