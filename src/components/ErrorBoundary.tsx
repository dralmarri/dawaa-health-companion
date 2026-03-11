import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  handleReload = () => {
    // Clear potentially corrupted localStorage data
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("dawaa_")) {
          try {
            const data = localStorage.getItem(key);
            if (data) JSON.parse(data); // Test if valid JSON
          } catch {
            localStorage.removeItem(key); // Remove corrupted data
          }
        }
      });
    } catch {
      // localStorage not available
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="auto">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">💊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dawaa+</h1>
            <p className="text-gray-600 mb-2">حدث خطأ غير متوقع</p>
            <p className="text-gray-500 text-sm mb-6">An unexpected error occurred</p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              إعادة تحميل / Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
