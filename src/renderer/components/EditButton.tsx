import React, { useState } from 'react';

interface EditButtonProps {
  value: string | number;
  onSave: (newValue: string | number) => Promise<void>;
  fieldType?: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
  className?: string;
}

const EditButton: React.FC<EditButtonProps> = ({
  value,
  onSave,
  fieldType = 'text',
  options = [],
  placeholder = 'Enter value',
  className = ''
}) => {
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
    } catch (error) {
      console.error('Error saving:', error);
      // Reset to original value on error
      setEditValue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {fieldType === 'select' ? (
          <select
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            style={{ padding: '4px', fontSize: '12px' }}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={fieldType}
            value={editValue}
            onChange={(e) => setEditValue(fieldType === 'number' ? Number(e.target.value) : e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            autoFocus
            style={{ padding: '4px', fontSize: '12px', width: '80px' }}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            background: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '10px'
          }}
        >
          {isLoading ? '...' : '✓'}
        </button>
        <button
          onClick={handleCancel}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className={className}
      style={{
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        marginLeft: '5px'
      }}
      title="Click to edit"
    >
      ✏️ Edit
    </button>
  );
};

export default EditButton;
