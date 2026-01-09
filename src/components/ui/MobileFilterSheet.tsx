'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, SlidersHorizontal, Check, ChevronDown, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ActiveFilters {
  [groupId: string]: string[] | [number, number];
}

interface MobileFilterSheetProps {
  filters: FilterGroup[];
  activeFilters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  resultCount?: number;
  loading?: boolean;
  className?: string;
}

// =============================================================================
// Quick Filter Chips - Horizontal scrollable
// =============================================================================

interface QuickFilterChipsProps {
  filters: FilterGroup[];
  activeFilters: ActiveFilters;
  onToggle: (groupId: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

export function QuickFilterChips({
  filters,
  activeFilters,
  onToggle,
  onClear,
  className,
}: QuickFilterChipsProps) {
  // Flatten popular options from each filter group
  const quickOptions = filters
    .flatMap((group) =>
      (group.options || [])
        .slice(0, 3) // Top 3 from each group
        .map((opt) => ({
          groupId: group.id,
          value: opt.value,
          label: opt.label,
        }))
    )
    .slice(0, 8); // Max 8 total

  const hasActiveFilters = Object.values(activeFilters).some(
    (vals) => Array.isArray(vals) && vals.length > 0
  );

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
        {/* Clear All Chip */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200 whitespace-nowrap snap-start"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}

        {/* Quick Filter Chips */}
        {quickOptions.map((option) => {
          const isActive =
            Array.isArray(activeFilters[option.groupId]) &&
            (activeFilters[option.groupId] as string[]).includes(option.value);

          return (
            <button
              key={`${option.groupId}-${option.value}`}
              onClick={() => onToggle(option.groupId, option.value)}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors snap-start',
                isActive
                  ? 'bg-brand-gold text-white border-brand-gold'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              )}
            >
              {isActive && <Check className="w-3 h-3" />}
              {option.label}
            </button>
          );
        })}
      </div>
      
      {/* Fade gradient on right */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white pointer-events-none" />
    </div>
  );
}

// =============================================================================
// Mobile Filter Sheet (Bottom Sheet)
// =============================================================================

export function MobileFilterSheet({
  filters,
  activeFilters,
  onChange,
  resultCount,
  loading = false,
  className,
}: MobileFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ActiveFilters>(activeFilters);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync local filters when activeFilters change
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).reduce((count, vals) => {
    if (Array.isArray(vals)) {
      return count + vals.length;
    }
    return count;
  }, 0);

  const handleToggle = (groupId: string, value: string) => {
    setLocalFilters((prev) => {
      const current = (prev[groupId] as string[]) || [];
      const isActive = current.includes(value);

      return {
        ...prev,
        [groupId]: isActive
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleRangeChange = (groupId: string, range: [number, number]) => {
    setLocalFilters((prev) => ({
      ...prev,
      [groupId]: range,
    }));
  };

  const handleApply = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared: ActiveFilters = {};
    filters.forEach((group) => {
      cleared[group.id] = group.type === 'range' ? [group.min || 0, group.max || 100] : [];
    });
    setLocalFilters(cleared);
    onChange(cleared);
  };

  const handleQuickToggle = useCallback(
    (groupId: string, value: string) => {
      const current = (activeFilters[groupId] as string[]) || [];
      const isActive = current.includes(value);

      onChange({
        ...activeFilters,
        [groupId]: isActive
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    },
    [activeFilters, onChange]
  );

  return (
    <div className={cn('md:hidden', className)}>
      {/* Quick Filter Chips */}
      <QuickFilterChips
        filters={filters}
        activeFilters={activeFilters}
        onToggle={handleQuickToggle}
        onClear={handleClear}
        className="mb-3"
      />

      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        All Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-gold text-white text-xs">
            {activeFilterCount}
          </span>
        )}
        {resultCount !== undefined && (
          <span className="ml-auto text-gray-500">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `${resultCount} results`
            )}
          </span>
        )}
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -m-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Groups */}
            <div className="flex-1 overflow-y-auto">
              {filters.map((group) => {
                const isExpanded = expandedGroup === group.id;
                const activeCount = Array.isArray(localFilters[group.id])
                  ? (localFilters[group.id] as string[]).length
                  : 0;

                return (
                  <div key={group.id} className="border-b border-gray-100">
                    {/* Group Header */}
                    <button
                      onClick={() =>
                        setExpandedGroup(isExpanded ? null : group.id)
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="font-medium text-gray-900">
                        {group.label}
                        {activeCount > 0 && (
                          <span className="ml-2 text-sm text-brand-gold">
                            ({activeCount})
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Group Options */}
                    {isExpanded && group.options && (
                      <div className="px-4 pb-3 space-y-2">
                        {group.options.map((option) => {
                          const isActive =
                            Array.isArray(localFilters[group.id]) &&
                            (localFilters[group.id] as string[]).includes(
                              option.value
                            );

                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 py-2 cursor-pointer"
                            >
                              <div
                                className={cn(
                                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                  isActive
                                    ? 'bg-brand-gold border-brand-gold'
                                    : 'border-gray-300'
                                )}
                              >
                                {isActive && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() =>
                                  handleToggle(group.id, option.value)
                                }
                                className="sr-only"
                              />
                              <span className="flex-1 text-gray-700">
                                {option.label}
                              </span>
                              {option.count !== undefined && (
                                <span className="text-sm text-gray-400">
                                  {option.count}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Range Slider */}
                    {isExpanded && group.type === 'range' && (
                      <div className="px-4 pb-4">
                        <PriceRangeSlider
                          min={group.min || 0}
                          max={group.max || 10000}
                          step={group.step || 100}
                          value={
                            (localFilters[group.id] as [number, number]) || [
                              group.min || 0,
                              group.max || 10000,
                            ]
                          }
                          onChange={(range) =>
                            handleRangeChange(group.id, range)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white safe-area-bottom">
              <button
                onClick={handleApply}
                className="w-full py-3 bg-brand-gold text-white rounded-lg font-medium hover:bg-brand-gold/90 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Show {resultCount ?? '—'} Results
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Price Range Slider
// =============================================================================

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

function PriceRangeSlider({
  min,
  max,
  step,
  value,
  onChange,
}: PriceRangeSliderProps) {
  const [localMin, localMax] = value;

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{formatPrice(localMin)}</span>
        <span className="text-gray-400">—</span>
        <span className="font-medium text-gray-700">{formatPrice(localMax)}</span>
      </div>

      <div className="relative h-2">
        {/* Track */}
        <div className="absolute inset-0 bg-gray-200 rounded-full" />
        
        {/* Active Range */}
        <div
          className="absolute h-full bg-brand-gold rounded-full"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
          }}
        />

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => {
            const newMin = Math.min(Number(e.target.value), localMax - step);
            onChange([newMin, localMax]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => {
            const newMax = Math.max(Number(e.target.value), localMin + step);
            onChange([localMin, newMax]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Desktop Filter Sidebar (bonus - for desktop parity)
// =============================================================================

interface DesktopFilterSidebarProps {
  filters: FilterGroup[];
  activeFilters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  resultCount?: number;
  loading?: boolean;
  className?: string;
}

export function DesktopFilterSidebar({
  filters,
  activeFilters,
  onChange,
  resultCount,
  loading = false,
  className,
}: DesktopFilterSidebarProps) {
  const handleToggle = (groupId: string, value: string) => {
    const current = (activeFilters[groupId] as string[]) || [];
    const isActive = current.includes(value);

    onChange({
      ...activeFilters,
      [groupId]: isActive
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const activeFilterCount = Object.values(activeFilters).reduce((count, vals) => {
    if (Array.isArray(vals)) {
      return count + vals.length;
    }
    return count;
  }, 0);

  const handleClear = () => {
    const cleared: ActiveFilters = {};
    filters.forEach((group) => {
      cleared[group.id] = [];
    });
    onChange(cleared);
  };

  return (
    <div className={cn('hidden md:block', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-gray-900">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : `${resultCount} products`}
        </p>
      )}

      {/* Filter Groups */}
      <div className="space-y-6">
        {filters.map((group) => (
          <div key={group.id}>
            <h3 className="font-medium text-gray-900 mb-3">{group.label}</h3>
            <div className="space-y-2">
              {group.options?.map((option) => {
                const isActive =
                  Array.isArray(activeFilters[group.id]) &&
                  (activeFilters[group.id] as string[]).includes(option.value);

                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-brand-gold border-brand-gold'
                          : 'border-gray-300 group-hover:border-gray-400'
                      )}
                    >
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggle(group.id, option.value)}
                      className="sr-only"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {option.count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
