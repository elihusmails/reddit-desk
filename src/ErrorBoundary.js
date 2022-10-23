import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("caught?");
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    // console.log("rendering error boundary", this.state);
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <h1>Something went wrong.</h1>
      );
    }

    return this.props.children;
  }
}
