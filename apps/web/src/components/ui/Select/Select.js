'use client';

import { useState, forwardRef, useRef, useEffect } from 'react';
import styles from './Select.module.css';
import { clsx } from 'clsx';

const Select = forwardRef(({ 
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Selecione uma opção',
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  className,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [useFixedPositioning, setUseFixedPositioning] = useState(false);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const selectId = props.id || (isHydrated ? `select-${Math.random().toString(36).substr(2, 9)}` : 'select-ssr');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate dropdown position for fixed positioning
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.querySelector(`.${styles.select}`)?.getBoundingClientRect();
      if (rect) {
        const top = rect.bottom + window.scrollY + 4; // 4px gap below select
        const left = rect.left + window.scrollX;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 240; // Max height from CSS
        
        // Check if dropdown fits below, if not position above
        const fitsBelow = rect.bottom + dropdownHeight < viewportHeight;
        
        setDropdownPosition({
          top: fitsBelow ? top : rect.top + window.scrollY - dropdownHeight - 4,
          left: left
        });
        
        // Use fixed positioning on mobile and tablet, absolute on desktop
        setUseFixedPositioning(window.innerWidth < 1024);
      }
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (!value) return '';
    if (multiple) {
      const selectedOptions = options.filter(opt => value.includes(opt.value));
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : '';
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (multiple) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value];
      onChange?.(newValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleOptionSelect(filteredOptions[focusedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        selectRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case ' ':
        if (!searchable) {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(-1);
  };

  return (
    <div 
      ref={selectRef}
      className={clsx(
        styles.selectGroup,
        {
          [styles.fullWidth]: fullWidth,
          [styles.hasError]: error,
          [styles.disabled]: disabled
        },
        className
      )}
    >
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.selectWrapper}>
        <div
          className={clsx(
            styles.select,
            styles[variant],
            styles[size],
            {
              [styles.open]: isOpen,
              [styles.hasValue]: value
            }
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {searchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className={styles.searchInput}
              autoFocus
            />
          ) : (
            <span className={styles.value}>
              {getDisplayValue() || placeholder}
            </span>
          )}
          
          <span className={styles.arrow}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path 
                d="M1 1.5L6 6.5L11 1.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className={clsx(
              styles.dropdown, 
              { [styles.fixed]: useFixedPositioning }
            )}
            style={useFixedPositioning ? {
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: selectRef.current?.querySelector(`.${styles.select}`)?.offsetWidth || 'auto'
            } : {}}
            role="listbox" 
            aria-multiselectable={multiple}
          >
            {filteredOptions.length === 0 ? (
              <div className={styles.noOptions}>
                {searchable && searchTerm ? 'Nenhuma opção encontrada' : 'Sem opções disponíveis'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={clsx(
                    styles.option,
                    {
                      [styles.selected]: multiple 
                        ? value?.includes(option.value)
                        : value === option.value,
                      [styles.focused]: index === focusedIndex,
                      [styles.disabled]: option.disabled
                    }
                  )}
                  onClick={() => !option.disabled && handleOptionSelect(option)}
                  role="option"
                  aria-selected={multiple 
                    ? value?.includes(option.value)
                    : value === option.value
                  }
                >
                  {multiple && (
                    <span className={styles.checkbox}>
                      {value?.includes(option.value) && '✓'}
                    </span>
                  )}
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && (
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {error && <span className={styles.error} id={`${selectId}-error`}>{error}</span>}
      {helperText && !error && (
        <span className={styles.helperText} id={`${selectId}-helper`}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;