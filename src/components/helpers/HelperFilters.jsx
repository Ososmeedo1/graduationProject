import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useDebounce } from '../../hooks/useDebounce';

const HelperFilters = ({ onFilter, initialFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(
    initialFilters || {
      search: '',
      approvalStatus: 'all',
      accountStatus: 'all',
    }
  );
  const [localFilters, setLocalFilters] = useState(
    initialFilters || {
      search: '',
      approvalStatus: 'all',
      accountStatus: 'all',
    }
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(searchInput, 400);

  // Update parent when debounced search changes
  /* useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch };
      onFilter(newFilters);
    }
  }, [debouncedSearch, filters, onFilter]); */

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(localFilters);
    onFilter(localFilters);
  };

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const reset = {
      search: '',
      approvalStatus: 'all',
      accountStatus: 'all',
    };
    setSearchInput('');
    setLocalFilters(reset);
    setFilters(reset);
    onFilter(reset);
  };

  const removeFilter = (key) => {
    const newFilters = {
      ...filters,
      [key]: key === 'search' ? '' : 'all'
    };
    if (key === 'search') {
      setSearchInput('');
    }
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const approvalOptions = [
    { value: 'all', label: t('common.all', 'All') },
    { value: 'Pending', label: t('helpers.approval.pending', 'Pending') },
    { value: 'UnderReview', label: t('helpers.approval.underReview', 'Under Review') },
    { value: 'Approved', label: t('helpers.approval.approved', 'Approved') },
    { value: 'Rejected', label: t('helpers.approval.rejected', 'Rejected') },
    { value: 'ChangesRequested', label: t('helpers.approval.changesRequested', 'Changes Requested') },
  ];

  const accountOptions = [
    { value: 'all', label: t('common.all', 'All') },
    { value: 'active', label: t('common.active', 'Active') },
    { value: 'suspended', label: t('helpers.account.suspended', 'Suspended') },
    { value: 'banned', label: t('helpers.account.banned', 'Banned') },
    { value: 'inactive', label: t('helpers.account.inactive', 'Inactive') },
  ];

  const yesNoOptions = [
    { value: 'all', label: t('common.all', 'All') },
    { value: 'yes', label: t('common.yes', 'Yes') },
    { value: 'no', label: t('common.no', 'No') },
  ];

  const getFilterLabel = (key, value) => {
    if (key === 'approvalStatus') {
      return approvalOptions.find(o => o.value === value)?.label || value;
    }
    if (key === 'accountStatus') {
      return accountOptions.find(o => o.value === value)?.label || value;
    }
    return value;
  };

  const activeFilters = [];
  if (filters.search) {
    activeFilters.push({ key: 'search', label: `"${filters.search}"` });
  }
  if (filters.approvalStatus !== 'all') {
    activeFilters.push({ key: 'approvalStatus', label: getFilterLabel('approvalStatus', filters.approvalStatus) });
  }
  if (filters.accountStatus !== 'all') {
    activeFilters.push({ key: 'accountStatus', label: getFilterLabel('accountStatus', filters.accountStatus) });
  }

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-stroke mb-4 overflow-hidden">
      {/* Main Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={t('helpers.searchPlaceholder', 'Search by name, email, or phone...')}
              value={searchInput}
              onChange={handleSearchChange}
              icon={<Search size={18} />}
              className="w-full"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setLocalFilters((prev) => ({ ...prev, search: '' }));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex items-center gap-2"
            >
              <Search size={16} />
              <span className="hidden sm:inline">{t('common.search', 'Search')}</span>
            </Button>

            <Button
              type="button"
              variant={showAdvanced ? 'primary' : 'outline'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">{t('common.filters', 'Filters')}</span>
              {activeFilters.length > 0 && (
                <span className="ml-1 bg-primary-200/40 text-primary-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted mr-1">{t('common.activeFilters', 'Active filters:')}</span>
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-sm border border-primary-200"
              >
                <span className="max-w-[150px] truncate">{filter.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      [filter.key]: filter.key === 'search' ? '' : 'all'
                    };
                    setFilters(newFilters);
                    onFilter(newFilters);
                  }}
                  className="p-0.5 hover:bg-primary-100 rounded"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-ink-muted hover:text-ink hover:bg-surface-inset rounded-md transition-colors"
            >
              <RotateCcw size={12} />
              {t('common.clear', 'Clear all')}
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t border-stroke bg-surface-muted p-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">
                {t('helpers.approval.label', 'Approval Status')}
              </label>
              <Select
                options={approvalOptions}
                value={localFilters.approvalStatus}
                onChange={(e) => handleChange('approvalStatus', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">
                {t('helpers.account.label', 'Account Status')}
              </label>
              <Select
                options={accountOptions}
                value={localFilters.accountStatus}
                onChange={(e) => handleChange('accountStatus', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Mobile Clear Button */}
          <div className="mt-4 md:hidden">
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              <RotateCcw size={14} className="mr-2" />
              {t('common.clearFilters', 'Clear Filters')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperFilters;
