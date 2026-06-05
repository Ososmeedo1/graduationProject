import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Button from '../../components/ui/Button';
import BookingTable from '../../components/admin/bookings/BookingTable';
import BookingFilterForm from '../../components/admin/bookings/BookingFilterForm';
import BookingStatsCards from '../../components/admin/bookings/BookingStatsCards';
import { services } from '../../services';

const AdminBookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState(null);
  const defaultFilters = {
    search: '',
    status: 'all',
    type: 'all',
    paymentStatus: 'all',
    city: '',
    from: '',
    to: '',
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        Search: filters.search,
        Status: filters.status !== 'all' ? filters.status : undefined,
        Type: filters.type !== 'all' ? filters.type : undefined,
        PaymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        City: filters.city || undefined,
        From: filters.from || undefined,
        To: filters.to || undefined,
        Page: pagination.page,
        PageSize: pagination.limit,
      };

      const result = await services.bookings.getBookings(params);
      setData(result.items || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: result.totalPages || 1,
      }));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, t]);

  const fetchBookingStats = useCallback(async () => {
    try {
      const stats = await services.bookings.getBookingStats();
      setBookingStats(stats);
    } catch {
      setBookingStats(null);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookingStats();
  }, [fetchBookingStats]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleView = (booking) => {
    navigate(`/admin/bookings/${booking.id}`);
  };

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('bookings.title')}</h1>
          <p className="text-ink-muted">{t('bookings.subtitle')}</p>
        </div>
      </div>

      <BookingStatsCards bookingStats={bookingStats} currency={bookingStats?.currency} />

      <BookingFilterForm onFilter={handleFilterChange} initialFilters={filters} />

      <div className="bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
        <BookingTable data={data} isLoading={loading} onView={handleView} />
      </div>

      <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-stroke">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
        >
          {t('common.previous')}
        </Button>
        <span className="text-sm text-ink-muted">
          {t('common.pageOf', { page: pagination.page, total: pagination.totalPages })}
        </span>
        <Button
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
        >
          {t('common.next')}
        </Button>
      </div>
    </DirectionalWrapper>
  );
};

export default AdminBookingsPage;
