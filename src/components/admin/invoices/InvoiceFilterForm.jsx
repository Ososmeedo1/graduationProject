import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { useDebounce } from '../../../hooks/useDebounce';

const InvoiceFilterForm = ({ onFilter, initialFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(
    initialFilters || {
      search: '',
      paymentStatus: 'all',
      status: 'all',
      from: '',
      to: '',
    }
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Apply debounced search to filters
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch };
      setFilters(newFilters);
      onFilter(newFilters);
    }
  }, [debouncedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchInput };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const reset = {
      search: '',
      paymentStatus: 'all',
      status: 'all',
      from: '',
      to: '',
    };
    setSearchInput('');
    setFilters(reset);
    onFilter(reset);
  };

  const paymentStatusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'Paid', label: 'Paid' },
    { value: 'AwaitingPayment', label: 'Awaiting Payment' },
    { value: 'PaymentPending', label: 'Payment Pending' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Failed', label: 'Failed' },
  ];

  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'Issued', label: t('invoices.status.issued') },
    { value: 'Voided', label: t('invoices.status.voided') },
  ];

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-stroke mb-4 overflow-hidden">
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={t('common.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
                {t('invoices.fields.paymentStatus')}
              </label>
              <Select
                options={paymentStatusOptions}
                value={filters.paymentStatus}
                onChange={(e) => handleChange('paymentStatus', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('invoices.fields.status')}
              </label>
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                {t('reports.startDate')}
              </label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => handleChange('from', e.target.value)}
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

export default InvoiceFilterForm;
