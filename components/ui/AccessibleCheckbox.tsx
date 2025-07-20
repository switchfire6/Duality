import React, { useState, useRef } from 'react';

interface AccessibleCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  helpText?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  id,
  helpText
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  
  // Generate unique ID if not provided
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  const descriptionId = helpText ? `${checkboxId}-description` : undefined;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };
  
  const handleLabelClick = () => {
    checkboxRef.current?.focus();
  };
  
  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            aria-checked={checked}
            aria-disabled={disabled}
            aria-describedby={descriptionId}
            className={`
              w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded 
              focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900
              focus:outline-none transition-all
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${isFocused ? 'scale-110' : ''}
            `}
          />
        </div>
        <div className="ml-3">
          <label 
            htmlFor={checkboxId}
            onClick={handleLabelClick}
            className={`
              text-sm font-medium cursor-pointer select-none
              ${disabled ? 'text-gray-500' : 'text-gray-300 hover:text-gray-200'}
              ${isFocused ? 'text-cyan-400' : ''}
            `}
          >
            {label}
          </label>
          {helpText && (
            <p 
              id={descriptionId}
              className="text-xs text-gray-500 mt-1"
            >
              {helpText}
            </p>
          )}
        </div>
      </div>
      
      {/* Focus indicator for screen readers */}
      {isFocused && (
        <div className="sr-only" role="status">
          {label} is {checked ? 'checked' : 'unchecked'}. Press space to toggle.
        </div>
      )}
    </div>
  );
};

export default AccessibleCheckbox;