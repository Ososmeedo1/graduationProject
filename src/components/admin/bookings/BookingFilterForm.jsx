import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { useDebounce } from '../../../hooks/useDebounce';

const BookingFilterForm = ({ onFilter, initialFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(
    initialFilters || {
      search: '',
      status: 'all',
      type: 'all',
      paymentStatus: 'all',
      city: '',
      from: '',
      to: '',
    }
  );
  const [localFilters, setLocalFilters] = useState(
    initialFilters || {
      search: '',
      status: 'all',
      type: 'all',
      paymentStatus: 'all',
      city: '',
      from: '',
      to: '',
    }
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const debouncedSearch = useDebounce(searchInput, 400);

  /* useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch };
      onFilter(newFilters);
    }
  }, [debouncedSearch, filters, onFilter]); */

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
      status: 'all',
      type: 'all',
      paymentStatus: 'all',
      city: '',
      from: '',
      to: '',
    };
    setSearchInput('');
    setLocalFilters(reset);
    setFilters(reset);
    onFilter(reset);
  };

  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'PendingHelperResponse', label: 'Pending' },
    { value: 'AcceptedByHelper', label: 'Confirmed' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'CancelledByUser', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'Scheduled', label: t('bookings.types.scheduled') },
    { value: 'Instant', label: t('bookings.types.instant') },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'NotRequired', label: t('bookings.paymentStatus.notRequired') },
    { value: 'AwaitingPayment', label: t('bookings.paymentStatus.awaitingPayment') },
    { value: 'Paid', label: t('bookings.paymentStatus.paid') },
    { value: 'Refunded', label: t('bookings.paymentStatus.refunded') },
    { value: 'Failed', label: t('bookings.paymentStatus.failed') },
  ];

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-stroke mb-4 overflow-hidden">
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={t('common.search')}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setLocalFilters((prev) => ({ ...prev, search: e.target.value }));
              }}
              icon={<Search size={18} />}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              <Search size={16} className="mr-2" />
              {t('common.search')}
            </Button>
            <Button
              type="button"
              variant={showAdvanced ? 'primary' : 'outline'}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              {t('common.filters')}
            </Button>
          </div>
        </form>
      </div>

      {showAdvanced && (
        <div className="border-t border-stroke bg-surface-muted p-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.status')}
              </label>
              <Select
                options={statusOptions}
                value={localFilters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.type')}
              </label>
              <Select
                options={typeOptions}
                value={localFilters.type}
                onChange={(e) => handleChange('type', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.paymentStatus')}
              </label>
              <Select
                options={paymentStatusOptions}
                value={localFilters.paymentStatus}
                onChange={(e) => handleChange('paymentStatus', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.destination')}
              </label>
              <Input
                value={localFilters.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder={t('bookings.fields.cityPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.from')}
              </label>
              <Input
                type="date"
                value={localFilters.from}
                onChange={(e) => handleChange('from', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('bookings.fields.to')}
              </label>
              <Input
                type="date"
                value={localFilters.to}
                onChange={(e) => handleChange('to', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <RotateCcw size={14} className="mr-2" />
                {t('common.clear')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilterForm;
