import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import logo from './img/Rama Resort Logo White without BG .png';
const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('admin'); // Default to admin for PIN-style login
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUserSelection, setShowUserSelection] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await window.electronAPI.authenticateUser(username, password);
            if (result.success && result.user) {
                console.log('Login successful:', result.user);
                onLoginSuccess(result.user);
            }
            else {
                setError(result.message || 'Invalid credentials');
            }
        }
        catch (error) {
            console.error('Login error:', error);
            setError('Connection error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const switchUser = (newUsername) => {
        setUsername(newUsername);
        setPassword('');
        setError('');
        setShowUserSelection(false);
    };
    return (_jsx("div", { className: "login-container", children: _jsxs("div", { className: "login-grid", children: [_jsx("div", { className: "login-left-column", children: _jsx("div", { className: "login-image-wrapper", style: {
                            background: 'linear-gradient(135deg, #0B6623 0%, #0F5132 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }, children: _jsx("div", { className: "login-overlay", children: _jsxs("div", { className: "login-branding", children: [_jsx("img", { src: logo, alt: "Rama Resort Logo", className: "login-logo", style: {
                                            width: '250px',
                                            height: 'auto',
                                            marginBottom: '30px',
                                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                                        } }), _jsx("h1", { className: "login-hotel-name", children: "Rama Resort" }), _jsx("p", { className: "login-hotel-tagline", children: "Luxury & Comfort" })] }) }) }) }), _jsx("div", { className: "login-right-column", children: _jsxs("div", { className: "login-content", children: [_jsx("h1", { className: "login-title", children: "Welcome Back" }), _jsx("p", { className: "login-subtitle", children: "Sign in to your account" }), _jsx("button", { type: "button", onClick: () => setShowUserSelection(!showUserSelection), className: "login-switch-button", children: "Switch User" }), showUserSelection && (_jsx("div", { className: "login-user-panel", children: _jsxs("div", { className: "login-user-options", children: [_jsxs("div", { className: "login-user-option", onClick: () => switchUser('admin'), children: [_jsx("div", { className: "login-user-avatar", children: "A" }), _jsxs("div", { className: "login-user-info", children: [_jsx("div", { className: "login-user-name", children: "Administrator" }), _jsx("div", { className: "login-user-role", children: "Admin" })] })] }), _jsxs("div", { className: "login-user-option", onClick: () => switchUser('user'), children: [_jsx("div", { className: "login-user-avatar", children: "U" }), _jsxs("div", { className: "login-user-info", children: [_jsx("div", { className: "login-user-name", children: "Hotel User" }), _jsx("div", { className: "login-user-role", children: "Staff" })] })] })] }) })), _jsxs("form", { onSubmit: handleLogin, children: [_jsx("input", { type: "hidden", value: username, onChange: (e) => setUsername(e.target.value) }), _jsxs("div", { className: "login-input-group", children: [_jsx("label", { className: "login-label", children: "Password" }), _jsxs("div", { className: "login-input-wrapper", children: [_jsx("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", className: "login-input", disabled: loading, autoComplete: "current-password", maxLength: 20 }), _jsx("svg", { className: "login-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), _jsx("button", { type: "button", className: "login-toggle-button", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsxs("svg", { style: { width: '16px', height: '16px' }, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) : (_jsx("svg", { style: { width: '16px', height: '16px' }, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" }) })) })] })] }), error && (_jsx("div", { className: "login-error", children: error })), _jsx("button", { type: "submit", className: "login-submit-button", disabled: loading, children: loading ? (_jsx("div", { className: "login-spinner" })) : ("Sign In") })] })] }) })] }) }));
};
export default LoginPage;
