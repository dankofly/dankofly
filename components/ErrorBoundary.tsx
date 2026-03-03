import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  language?: 'de' | 'en';
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isGerman = this.props.language !== 'en';
      return (
        <div className="max-w-xl mx-auto my-16 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            {isGerman ? 'Etwas ist schiefgelaufen' : 'Something went wrong'}
          </h2>
          <p className="text-red-600 mb-6">
            {isGerman
              ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.'
              : 'An unexpected error occurred. Please reload the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            {isGerman ? 'Seite neu laden' : 'Reload page'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
