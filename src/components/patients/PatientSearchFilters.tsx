import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PatientFilters {
  searchQuery: string;
  caseType: 'all' | 'new' | 'old';
  gender: 'all' | 'male' | 'female' | 'other';
  ageRange: { min: number | null; max: number | null };
  dateRange: { from: Date | null; to: Date | null };
}

interface PatientSearchFiltersProps {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  onReset: () => void;
}

export const defaultFilters: PatientFilters = {
  searchQuery: '',
  caseType: 'all',
  gender: 'all',
  ageRange: { min: null, max: null },
  dateRange: { from: null, to: null },
};

export function PatientSearchFilters({
  filters,
  onFiltersChange,
  onReset,
}: PatientSearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.caseType !== 'all' ||
    filters.gender !== 'all' ||
    filters.ageRange.min !== null ||
    filters.ageRange.max !== null ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  const activeFilterCount = [
    filters.caseType !== 'all',
    filters.gender !== 'all',
    filters.ageRange.min !== null || filters.ageRange.max !== null,
    filters.dateRange.from !== null || filters.dateRange.to !== null,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, or address..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            className="medical-input pl-10 pr-10"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, caseType: 'all' })}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              filters.caseType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            All
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, caseType: 'new' })}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              filters.caseType === 'new'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            New
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, caseType: 'old' })}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              filters.caseType === 'old'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Follow-up
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'gap-2',
            hasActiveFilters && 'border-primary text-primary'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="rounded-lg border border-border bg-card p-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Gender Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gender</label>
              <Select
                value={filters.gender}
                onValueChange={(value: 'all' | 'male' | 'female' | 'other') =>
                  onFiltersChange({ ...filters, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Age Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.ageRange.min ?? ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      ageRange: {
                        ...filters.ageRange,
                        min: e.target.value ? parseInt(e.target.value, 10) : null,
                      },
                    })
                  }
                  className="medical-input w-20"
                  min={0}
                  max={150}
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ageRange.max ?? ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      ageRange: {
                        ...filters.ageRange,
                        max: e.target.value ? parseInt(e.target.value, 10) : null,
                      },
                    })
                  }
                  className="medical-input w-20"
                  min={0}
                  max={150}
                />
              </div>
            </div>

            {/* Date Range - From */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Visit From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, 'dd MMM yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from ?? undefined}
                    onSelect={(date) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, from: date ?? null },
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range - To */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Visit To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.to && 'text-muted-foreground'
                    )}
                  >
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, 'dd MMM yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to ?? undefined}
                    onSelect={(date) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, to: date ?? null },
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={onReset} className="gap-2">
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showAdvanced && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.caseType !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {filters.caseType === 'new' ? 'New Cases' : 'Follow-ups'}
              <button
                onClick={() => onFiltersChange({ ...filters, caseType: 'all' })}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.gender !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
              {filters.gender}
              <button
                onClick={() => onFiltersChange({ ...filters, gender: 'all' })}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.ageRange.min !== null || filters.ageRange.max !== null) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Age: {filters.ageRange.min ?? 0} - {filters.ageRange.max ?? '∞'}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    ageRange: { min: null, max: null },
                  })
                }
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Visit:{' '}
              {filters.dateRange.from
                ? format(filters.dateRange.from, 'dd MMM')
                : '...'}{' '}
              -{' '}
              {filters.dateRange.to
                ? format(filters.dateRange.to, 'dd MMM')
                : '...'}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { from: null, to: null },
                  })
                }
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
