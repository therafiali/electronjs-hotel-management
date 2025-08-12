import React, { useState, useEffect } from "react";

interface PDFViewerProps {
  filepath: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ filepath, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when filepath changes
    setIsLoading(true);
    setError(null);
  }, [filepath]);

  useEffect(() => {
    // Add event listeners to webview when component mounts
    const webviewElement = document.querySelector(".pdf-webview") as any;

    if (webviewElement) {
      const handleLoad = () => {
        setIsLoading(false);
      };

      const handleError = () => {
        setIsLoading(false);
        setError("Failed to load PDF. Please check if the file exists.");
      };

      webviewElement.addEventListener("did-finish-load", handleLoad);
      webviewElement.addEventListener("did-fail-load", handleError);

      return () => {
        webviewElement.removeEventListener("did-finish-load", handleLoad);
        webviewElement.removeEventListener("did-fail-load", handleError);
      };
    }
  }, [filepath]);

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container">
        {/* Header */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <span className="pdf-icon">📄</span>
            <span>PDF Viewer</span>
          </div>
          <div className="pdf-viewer-controls">
            <button
              onClick={onClose}
              className="pdf-viewer-close-btn"
              title="Close PDF Viewer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pdf-viewer-content">
          {isLoading && (
            <div className="pdf-loading">
              <div className="loading-spinner"></div>
              <p>Loading PDF...</p>
            </div>
          )}

          {error && (
            <div className="pdf-error">
              <div className="error-icon">❌</div>
              <p>{error}</p>
              <button onClick={onClose} className="error-close-btn">
                Close
              </button>
            </div>
          )}

          <webview
            src={`file://${filepath}`}
            className="pdf-webview"
            style={{ display: isLoading || error ? "none" : "block" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
