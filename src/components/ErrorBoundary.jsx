import React from 'react';

/**
 * Last line of defence for the embedded tools.
 *
 * These tools render inside iframes on becomeawritertoday.com ranking pages.
 * Without a boundary, any render-time throw leaves a silent white box on the
 * live page. The fallback uses inline styles and system fonts on purpose so
 * it renders acceptably even if the stylesheet failed too, and stays legible
 * at small iframe sizes.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      // eslint-disable-next-line no-console
      console.error('BAWT writing tools failed to render:', error, errorInfo);
    } catch (e) {
      /* never let logging itself throw */
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '160px',
            padding: '24px 16px',
            textAlign: 'center',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#374151',
            backgroundColor: '#f9fafb',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600 }}>
            This tool couldn&apos;t load.
          </p>
          <a
            href="https://becomeawritertoday.com/tools/"
            style={{ fontSize: '14px', color: '#d60000' }}
          >
            Browse all writing tools
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
