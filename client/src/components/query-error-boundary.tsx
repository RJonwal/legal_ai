import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

interface QueryErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function QueryErrorFallback({ error, resetErrorBoundary }: QueryErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const is404Error = error.message.includes('404') || error.message.includes('Not Found');
  
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            {isNetworkError ? <WifiOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {isNetworkError ? 'Connection Issue' : is404Error ? 'Not Found' : 'Data Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {isNetworkError 
              ? 'Unable to connect to the server. Please check your internet connection.'
              : is404Error 
                ? 'The requested resource was not found.'
                : 'There was an issue loading the data. Please try again.'
            }
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={resetErrorBoundary}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {isNetworkError && (
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <QueryErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

// Simple error boundary for query errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void; fallbackRender: ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Query error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: () => {
          this.setState({ hasError: false, error: null });
          this.props.onReset();
        }
      });
    }

    return this.props.children;
  }
}