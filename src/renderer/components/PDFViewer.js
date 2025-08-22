import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const PDFViewer = ({ filepath, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        // Reset states when filepath changes
        setIsLoading(true);
        setError(null);
    }, [filepath]);
    useEffect(() => {
        // Add event listeners to webview when component mounts
        const webviewElement = document.querySelector(".pdf-webview");
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
    return (_jsx("div", { className: "pdf-viewer-overlay", children: _jsxs("div", { className: "pdf-viewer-container", children: [_jsxs("div", { className: "pdf-viewer-header", children: [_jsxs("div", { className: "pdf-viewer-title", children: [_jsx("span", { className: "pdf-icon", children: "\uD83D\uDCC4" }), _jsx("span", { children: "PDF Viewer" })] }), _jsx("div", { className: "pdf-viewer-controls", children: _jsx("button", { onClick: onClose, className: "pdf-viewer-close-btn", title: "Close PDF Viewer", children: "\u2715" }) })] }), _jsxs("div", { className: "pdf-viewer-content", children: [isLoading && (_jsxs("div", { className: "pdf-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading PDF..." })] })), error && (_jsxs("div", { className: "pdf-error", children: [_jsx("div", { className: "error-icon", children: "\u274C" }), _jsx("p", { children: error }), _jsx("button", { onClick: onClose, className: "error-close-btn", children: "Close" })] })), _jsx("webview", { src: `file://${filepath}`, className: "pdf-webview", style: { display: isLoading || error ? "none" : "block" } })] })] }) }));
};
export default PDFViewer;
