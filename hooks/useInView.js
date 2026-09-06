'use client'

import React, { useEffect, useRef, useState } from 'react'

/** Observe element visibility; returns [ref, inView]. Renders only when near viewport. */
export function useInView({ rootMargin = '240px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin, once])

  return [ref, inView]
}

/**
 * Lazy-mount wrapper. Children render only once scrolled near the viewport,
 * satisfying scroll-triggered lazy loading of charts/complex widgets.
 */
export default function LazyMount({ children, rootMargin = '260px', fallback }) {
  const [ref, inView] = useInView({ rootMargin })

  return (
    <div ref={ref}>
      {inView ? children : fallback || <LazyPlaceholder />}
    </div>
  )
}

export function LazyPlaceholder({ height = '100%' }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: height }}>
      <div className="flex items-center gap-3 text-tri text-xs tracking-widest uppercase">
        <span className="skeleton h-3 w-3 rounded-full inline-block" />
        hydrating viewport
      </div>
    </div>
  )
}

/** Global error boundary wrapper — catches crashes gracefully. */
export class SafeSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="card-3d flex flex-col items-start gap-3 p-6"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div className="chip tone-critical tone-soft">
            <span className="live-dot" aria-hidden="true" /> Segment degraded
          </div>
          <p className="text-sm text-sec">
            Something failed in this view. Your data pipeline is unaffected.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              if (this.props.onRetry) this.props.onRetry()
            }}
          >
            Reload segment
          </button>
        </div>
      )
    }
    return this.props.children
  }
}