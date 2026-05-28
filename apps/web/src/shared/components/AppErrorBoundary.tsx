import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App render failed", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-[#07111F] dark:text-white">
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-red-200 bg-white p-6 shadow-xl dark:border-red-900/40 dark:bg-[#0E1B2F]">
            <p className="text-xs font-black uppercase tracking-wide text-red-500">
              Error de renderizado
            </p>
            <h1 className="mt-2 text-2xl font-black">ExamInA no pudo abrir esta pantalla</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Recarga la página. Si vuelve a ocurrir, este mensaje nos permite ver el error real en vez de una pantalla en blanco.
            </p>
            <pre className="mt-5 max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs font-semibold text-red-100">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
