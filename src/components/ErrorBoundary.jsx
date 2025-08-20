import { Component } from 'react';
import { ErrorTypes, ErrorSeverity, handleError, errorManager } from '../utils/errorHandler';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const appError = handleError(
      ErrorTypes.INITIALIZATION,
      error,
      'アプリケーションでエラーが発生しました',
      ErrorSeverity.HIGH
    ).withContext({
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      error: appError,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReportError = () => {
    const { error } = this.state;
    if (error) {
      const errorReport = {
        message: error.message,
        type: error.type,
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.log('Error Report:', errorReport);
      alert('エラーレポートがコンソールに出力されました');
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
            report={this.handleReportError}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-12 h-12 text-red-500 mr-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">エラーが発生しました</h2>
                <p className="text-sm text-gray-600 mt-1">
                  申し訳ございません。予期しないエラーが発生しました。
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-red-50 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">エラータイプ:</span> {this.state.error.type}
                </p>
                <p className="text-sm text-red-800 mt-1">
                  <span className="font-semibold">詳細:</span> {this.state.error.message}
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-red-800 mt-1">
                    <span className="font-semibold">リトライ回数:</span> {this.state.retryCount}
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                再試行
              </button>
              <button
                onClick={this.handleReportError}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                エラーを報告
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => window.location.reload()}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;