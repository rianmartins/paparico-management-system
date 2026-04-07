import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

export type TestErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type TestErrorBoundaryState = {
  hasError: boolean;
};

export default class TestErrorBoundary extends Component<TestErrorBoundaryProps, TestErrorBoundaryState> {
  state: TestErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
