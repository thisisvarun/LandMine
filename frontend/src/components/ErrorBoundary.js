import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent 
        ? <this.props.FallbackComponent error={this.state.error} />
        : <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}