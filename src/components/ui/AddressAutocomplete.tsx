'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Address } from '@/types';

// =============================================================================
// Types
// =============================================================================

interface AddressSuggestion {
  id: string;
  text: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  value: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  onValidAddress?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// =============================================================================
// Mock Address Data (for demo - in production use Smarty Streets API)
// =============================================================================

const mockSuggestions: AddressSuggestion[] = [
  {
    id: '1',
    text: '123 Newbury Street, Boston, MA 02116',
    street1: '123 Newbury Street',
    city: 'Boston',
    state: 'MA',
    postalCode: '02116',
    country: 'US',
  },
  {
    id: '2',
    text: '456 Boylston Street, Boston, MA 02116',
    street1: '456 Boylston Street',
    city: 'Boston',
    state: 'MA',
    postalCode: '02116',
    country: 'US',
  },
  {
    id: '3',
    text: '789 Commonwealth Avenue, Boston, MA 02215',
    street1: '789 Commonwealth Avenue',
    city: 'Boston',
    state: 'MA',
    postalCode: '02215',
    country: 'US',
  },
  {
    id: '4',
    text: '100 Huntington Avenue, Boston, MA 02116',
    street1: '100 Huntington Avenue',
    city: 'Boston',
    state: 'MA',
    postalCode: '02116',
    country: 'US',
  },
  {
    id: '5',
    text: '1 Beacon Street, Boston, MA 02108',
    street1: '1 Beacon Street',
    city: 'Boston',
    state: 'MA',
    postalCode: '02108',
    country: 'US',
  },
];

// Filter suggestions based on query
function filterSuggestions(query: string): AddressSuggestion[] {
  if (!query || query.length < 3) return [];
  const lower = query.toLowerCase();
  return mockSuggestions.filter(
    (s) =>
      s.text.toLowerCase().includes(lower) ||
      s.street1.toLowerCase().includes(lower) ||
      s.city.toLowerCase().includes(lower) ||
      s.postalCode.includes(query)
  );
}

// =============================================================================
// US States for dropdown
// =============================================================================

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

// =============================================================================
// Component
// =============================================================================

export function AddressAutocomplete({
  value,
  onChange,
  onValidAddress,
  label = 'Address',
  placeholder = 'Start typing your address...',
  required = false,
  disabled = false,
  error,
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value.street1 || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (isManualEntry || !query || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      // In production, this would call the address API
      const results = filterSuggestions(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isManualEntry]);

  // Check address validity
  useEffect(() => {
    const isValid = !!(
      value.street1 &&
      value.city &&
      value.state &&
      value.postalCode &&
      value.country
    );
    onValidAddress?.(isValid);
  }, [value, onValidAddress]);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    onChange({
      ...value,
      street1: suggestion.street1,
      street2: suggestion.street2 || '',
      city: suggestion.city,
      state: suggestion.state,
      postalCode: suggestion.postalCode,
      country: suggestion.country,
    });
    setQuery(suggestion.street1);
    setIsOpen(false);
    setSuggestions([]);
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleManualEntryToggle = () => {
    setIsManualEntry(!isManualEntry);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleFieldChange = (field: keyof Address, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
    if (field === 'street1') {
      setQuery(fieldValue);
    }
  };

  return (
    <div className={cn('space-y-4', className)} ref={containerRef}>
      {/* Street Address with Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleFieldChange('street1', e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full pl-10 pr-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-start gap-3',
                  selectedIndex === index && 'bg-gray-50'
                )}
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{suggestion.street1}</p>
                  <p className="text-gray-500">
                    {suggestion.city}, {suggestion.state} {suggestion.postalCode}
                  </p>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={handleManualEntryToggle}
              className="w-full px-4 py-2 text-left text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-100"
            >
              Can't find your address? Enter manually
            </button>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Manual Entry Toggle */}
      <button
        type="button"
        onClick={handleManualEntryToggle}
        className="text-sm text-brand-gold hover:underline"
      >
        {isManualEntry ? 'Use address autocomplete' : 'Enter address manually'}
      </button>

      {/* Street 2 (Apt, Suite, etc.) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apartment, Suite, etc. (optional)
        </label>
        <input
          type="text"
          value={value.street2 || ''}
          onChange={(e) => handleFieldChange('street2', e.target.value)}
          placeholder="Apt 4B"
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'border-gray-300'
          )}
        />
      </div>

      {/* City, State, ZIP Row */}
      <div className="grid grid-cols-6 gap-4">
        {/* City */}
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="Boston"
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'border-gray-300'
            )}
          />
        </div>

        {/* State */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.state || ''}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              disabled={disabled}
              className={cn(
                'w-full px-3 py-2.5 border rounded-lg text-gray-900 appearance-none',
                'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                'border-gray-300'
              )}
            >
              <option value="">--</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ZIP Code */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value.postalCode || ''}
            onChange={(e) => {
              // Auto-fill city/state based on ZIP (mock implementation)
              const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
              handleFieldChange('postalCode', zip);
              
              // Mock: Auto-fill for Boston area ZIPs
              if (zip.length === 5 && zip.startsWith('021')) {
                onChange({
                  ...value,
                  postalCode: zip,
                  city: value.city || 'Boston',
                  state: value.state || 'MA',
                  country: 'US',
                });
              }
            }}
            placeholder="02116"
            maxLength={5}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'border-gray-300'
            )}
          />
        </div>
      </div>

      {/* Country (hidden, default US) */}
      <input type="hidden" value={value.country || 'US'} />
    </div>
  );
}

// =============================================================================
// Compact version for saved addresses
// =============================================================================

interface SavedAddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SavedAddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: SavedAddressCardProps) {
  return (
    <div
      className={cn(
        'relative p-4 border rounded-lg cursor-pointer transition-all',
        isSelected
          ? 'border-brand-gold bg-brand-gold/5 ring-2 ring-brand-gold/20'
          : 'border-gray-200 hover:border-gray-300'
      )}
      onClick={onSelect}
    >
      {address.isDefault && (
        <span className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          Default
        </span>
      )}
      
      <div className="flex items-start gap-3">
        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          {address.name && (
            <p className="font-medium text-gray-900">{address.name}</p>
          )}
          <p className="text-sm text-gray-600">
            {address.street1}
            {address.street2 && `, ${address.street2}`}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} {address.postalCode}
          </p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
