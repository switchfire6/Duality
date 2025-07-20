import React, { useRef, useEffect, useState } from 'react';

interface AccessibleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  id?: string;
  error?: string | null;
  warning?: string | null;
}

export const AccessibleSlider: React.FC<AccessibleSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  disabled = false,
  id,
  error = null,
  warning = null
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const announcementRef = useRef<HTMLDivElement>(null);
  
  // Generate unique ID if not provided
  const sliderId = id || `slider-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  // Calculate percentage for visual representation
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Format value for display
  const displayValue = value.toFixed(step < 1 ? 2 : 0);
  
  // Handle slider change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    
    // Update screen reader announcement
    setAnnouncement(`${label} changed to ${newValue.toFixed(2)}${unit}`);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let newValue = value;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(min, value - step);
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = Math.min(max, value + (max - min) * 0.1);
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = Math.max(min, value - (max - min) * 0.1);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }
    
    // Round to step precision
    newValue = Math.round(newValue / step) * step;
    
    if (newValue !== value) {
      onChange(newValue);
      setAnnouncement(`${label} changed to ${newValue.toFixed(2)}${unit}`);
    }
  };
  
  // Clear announcement after it's been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={sliderId}
        className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-500' : 'text-gray-300'}`}
      >
        {label}: 
        <span 
          className={`font-mono ml-2 ${disabled ? 'text-gray-500' : 'text-cyan-400'}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayValue}{unit}
        </span>
      </label>
      
      <div className="relative">
        <input
          ref={sliderRef}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          aria-label={`${label}, value ${displayValue}${unit}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${displayValue}${unit}`}
          aria-disabled={disabled}
          className={`
            w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${isFocused ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-gray-900' : ''}
            focus:outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-cyan-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-cyan-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:scale-110
            ${disabled ? '[&::-webkit-slider-thumb]:bg-gray-600 [&::-moz-range-thumb]:bg-gray-600' : ''}
          `}
          style={{
            background: `linear-gradient(to right, ${disabled ? '#4B5563' : '#06B6D4'} 0%, ${disabled ? '#4B5563' : '#06B6D4'} ${percentage}%, #374151 ${percentage}%, #374151 100%)`
          }}
        />
        
        {/* Focus indicator tooltip */}
        {isFocused && !disabled && (
          <div 
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-cyan-400 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
            role="tooltip"
          >
            {displayValue}{unit}
          </div>
        )}
      </div>
      
      {/* Validation messages */}
      {error && (
        <div className="text-xs text-red-400 mt-1" role="alert">
          {error}
        </div>
      )}
      {!error && warning && (
        <div className="text-xs text-yellow-400 mt-1" role="status">
          {warning}
        </div>
      )}
      
      {/* Keyboard shortcuts hint */}
      {isFocused && !disabled && !error && !warning && (
        <div className="text-xs text-gray-500 mt-1" role="status">
          Use arrow keys to adjust, Page Up/Down for large changes
        </div>
      )}
      
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
};

export default AccessibleSlider;