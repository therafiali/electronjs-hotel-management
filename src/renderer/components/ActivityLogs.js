import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const ActivityLogs = ({ onBackToDashboard }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadActivityLogs();
    }, []);
    const loadActivityLogs = async () => {
        try {
            setLoading(true);
            const allLogs = await window.electronAPI.getAllActivityLogs();
            setLogs(allLogs);
            console.log("Loaded activity logs:", allLogs);
        }
        catch (error) {
            console.error("Error loading activity logs:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const formatTimestamp = (timestamp) => {
        try {
            return new Date(timestamp).toLocaleString();
        }
        catch {
            return timestamp;
        }
    };
    const getActionColor = (action) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return '#27ae60';
            case 'UPDATE':
                return '#f39c12';
            case 'DELETE':
                return '#e74c3c';
            default:
                return '#3498db';
        }
    };
    if (loading) {
        return (_jsx("div", { style: { textAlign: 'center', padding: '50px' }, children: _jsx("div", { children: "Loading activity logs..." }) }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }, children: [_jsx("h1", { style: { margin: 0, color: '#2c3e50' }, children: "\uD83D\uDCCA Activity Logs" }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: async () => {
                                    if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
                                        try {
                                            await window.electronAPI.clearActivityLogs();
                                            await loadActivityLogs(); // Refresh the logs
                                        }
                                        catch (error) {
                                            console.error('Error clearing activity logs:', error);
                                            alert('Error clearing activity logs!');
                                        }
                                    }
                                }, style: {
                                    background: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }, children: "\uD83D\uDDD1\uFE0F Clear All Logs" }), _jsx("button", { onClick: onBackToDashboard, style: {
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }, children: "\u2190 Back to Dashboard" })] })] }), _jsxs("div", { className: "items-form", children: [_jsx("h2", { children: "\uD83D\uDD04 System Activity History" }), logs.length === 0 ? (_jsxs("div", { style: {
                            textAlign: "center",
                            padding: "40px",
                            color: "#666",
                            background: "#f8f9fa",
                            borderRadius: "8px"
                        }, children: [_jsx("div", { style: { fontSize: '18px', marginBottom: '10px' }, children: "\uD83D\uDCDD No activity logs found" }), _jsx("div", { children: "Activity will appear here when you make changes to rooms, items, or invoices." })] })) : (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: '#2c3e50', color: 'white' }, children: [_jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Date & Time" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Action" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Table" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Description" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Field" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "Old Value" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "New Value" }), _jsx("th", { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }, children: "User" })] }) }), _jsx("tbody", { children: logs.map((log) => (_jsxs("tr", { style: { borderBottom: '1px solid #eee' }, children: [_jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '12px' }, children: formatTimestamp(log.timestamp) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee' }, children: _jsx("span", { style: {
                                                        background: getActionColor(log.action),
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold'
                                                    }, children: log.action }) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }, children: log.tableName }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', maxWidth: '200px' }, children: log.description }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '12px' }, children: log.fieldName || '-' }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '12px' }, children: log.oldValue || '-' }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '12px' }, children: log.newValue || '-' }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }, children: log.userId })] }, log.id))) })] }) }))] })] }));
};
export default ActivityLogs;
