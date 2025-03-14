import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong. Please refresh the page.
          </h1>
        </div>
      )
    }
    return this.props.children
  }
}