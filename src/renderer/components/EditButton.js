import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const EditButton = ({ value, onSave, fieldType = 'text', options = [], placeholder = 'Enter value', className = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const handleEdit = () => {
        setIsEditing(true);
        setEditValue(value);
    };
    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }
        try {
            setIsLoading(true);
            await onSave(editValue);
            setIsEditing(false);
        }
        catch (error) {
            console.error('Error saving:', error);
            // Reset to original value on error
            setEditValue(value);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
        else if (e.key === 'Escape') {
            handleCancel();
        }
    };
    if (isEditing) {
        return (_jsxs("div", { style: { display: 'flex', gap: '5px', alignItems: 'center' }, children: [fieldType === 'select' ? (_jsx("select", { value: editValue, onChange: (e) => setEditValue(e.target.value), onKeyDown: handleKeyPress, autoFocus: true, style: { padding: '4px', fontSize: '12px' }, children: options.map((option) => (_jsx("option", { value: option, children: option }, option))) })) : (_jsx("input", { type: fieldType, value: editValue, onChange: (e) => setEditValue(fieldType === 'number' ? Number(e.target.value) : e.target.value), onKeyDown: handleKeyPress, placeholder: placeholder, autoFocus: true, style: { padding: '4px', fontSize: '12px', width: '80px' } })), _jsx("button", { onClick: handleSave, disabled: isLoading, style: {
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '10px'
                    }, children: isLoading ? '...' : '✓' }), _jsx("button", { onClick: handleCancel, style: {
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }, children: "\u2715" })] }));
    }
    return (_jsx("button", { onClick: handleEdit, className: className, style: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            marginLeft: '5px'
        }, title: "Click to edit", children: "\u270F\uFE0F Edit" }));
};
export default EditButton;
