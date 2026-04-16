import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const isAr = document.documentElement.lang === "ar";

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <AlertTriangle className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif font-bold text-primary">
                {isAr ? "عذراً، حدث خطأ غير متوقع" : "Oops, something went wrong"}
              </h1>
              <p className="text-sm text-muted-foreground font-naskh">
                {isAr 
                  ? "نعتذر عن هذا الخلل. حاول إعادة تحميل الصفحة أو العودة للرئيسية."
                  : "We apologize for the inconvenience. Try reloading or going back home."}
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-left overflow-hidden">
                <p className="text-[10px] font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReset}
                variant="default"
                className="flex-1 h-12 rounded-xl gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                {isAr ? "إعادة المحاولة" : "Try Again"}
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1 h-12 rounded-xl gap-2"
              >
                <Home className="w-4 h-4" />
                {isAr ? "الرئيسية" : "Home"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
