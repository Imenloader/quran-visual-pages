import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center z-[9999] relative">
          <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-primary mb-2">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-sm text-primary/60 mb-8 max-w-md">
            نعتذر عن هذا الخلل. لقد واجه التطبيق مشكلة أثناء معالجة طلبك.
            <br/>
            Something went wrong while processing your request.
          </p>

          {this.state.error && (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-4 mb-8 w-full max-w-md text-left overflow-auto">
              <code className="text-[10px] text-rose-500/80 break-words font-mono">
                {this.state.error.message}
              </code>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-serif font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث الصفحة (Reload)
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="h-12 px-6 rounded-xl bg-primary/10 text-primary font-serif font-bold flex items-center hover:bg-primary/20 transition-colors"
            >
              الرئيسية (Home)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
