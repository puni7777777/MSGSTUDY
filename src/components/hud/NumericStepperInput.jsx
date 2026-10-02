'use client';

import React, { useState } from 'react';

/**
 * NumericStepperInput
 * Custom dark-mode numeric input with integrated up & down arrow buttons.
 * Allows direct entry of negative numbers (compressive loads) without coercion lockout.
 * Implements accessible labels and compliant touch/click targets.
 */
export default function NumericStepperInput({
  value,
  onChange,
  step = 1,
  min,
  max,
  precision = 2,
  accent = 'cyan', // 'cyan' | 'amber'
  className = '',
  id,
  ariaLabel,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [focusedText, setFocusedText] = useState('');

  // Derived display value: use active typing buffer when focused, formatted prop when blurred
  const displayValue = isFocused
    ? focusedText
    : value !== undefined && value !== null
    ? String(value)
    : '';

  const accentBorder =
    accent === 'amber'
      ? 'focus:border-amber-400 focus:ring-amber-500'
      : 'focus:border-cyan-400 focus:ring-cyan-500';

  const accentHover =
    accent === 'amber'
      ? 'hover:text-amber-300 hover:bg-amber-950/40'
      : 'hover:text-cyan-300 hover:bg-cyan-950/40';

  const handleFocus = () => {
    setIsFocused(true);
    setFocusedText(value !== undefined && value !== null ? String(value) : '');
  };

  // Direct keyboard input handler
  const handleInputChange = (e) => {
    const raw = e.target.value;
    setFocusedText(raw);

    // Accept valid floating-point and integer patterns
    if (/^-?\d*\.?\d*$/.test(raw) && raw !== '' && raw !== '-' && raw !== '.' && raw !== '-.') {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        let constrained = parsed;
        if (min !== undefined && constrained < min) constrained = min;
        if (max !== undefined && constrained > max) constrained = max;
        onChange(constrained);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = parseFloat(focusedText);
    if (isNaN(parsed)) {
      parsed = min !== undefined ? min : 0;
    }
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    const formatted = Number(parsed.toFixed(precision));
    onChange(formatted);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep('down');
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleStep = (direction) => {
    const base = typeof value === 'number' ? value : parseFloat(value) || 0;
    let next = direction === 'up' ? base + step : base - step;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    const formatted = Number(next.toFixed(precision));
    if (isFocused) {
      setFocusedText(String(formatted));
    }
    onChange(formatted);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        aria-label={ariaLabel || id || 'Numeric value'}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`w-full bg-slate-800/90 border border-slate-700 rounded px-2.5 py-1.5 pr-7 text-slate-100 font-bold text-xs focus:outline-none ${accentBorder} focus:ring-1 select-text transition-colors`}
      />
      <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-0.5">
        <button
          onClick={() => handleStep('up')}
          className={`px-1 py-0.5 min-h-[14px] flex items-center justify-center text-slate-400 ${accentHover} rounded transition-colors cursor-pointer`}
          type="button"
          aria-label={`Increase ${ariaLabel || 'value'} by ${step}`}
          title={`Increase by ${step}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => handleStep('down')}
          className={`px-1 py-0.5 min-h-[14px] flex items-center justify-center text-slate-400 ${accentHover} rounded transition-colors cursor-pointer`}
          type="button"
          aria-label={`Decrease ${ariaLabel || 'value'} by ${step}`}
          title={`Decrease by ${step}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
