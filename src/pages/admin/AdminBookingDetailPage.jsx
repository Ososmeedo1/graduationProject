import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, DollarSign, History, Send, CreditCard, FileText, Map } from 'lucide-react';
import InvoiceDetails from '../../components/admin/invoices/InvoiceDetails';
import BookingMapView from '../../components/admin/bookings/BookingMapView';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Skeleton from '../../components/ui/Skeleton';
import BookingOverview from '../../components/admin/bookings/BookingOverview';
import BookingFinancials from '../../components/admin/bookings/BookingFinancials';
import BookingTimeline from '../../components/admin/bookings/BookingTimeline';
import BookingDispatchLog from '../../components/admin/bookings/BookingDispatchLog';
import PaymentDetails from '../../components/admin/payments/PaymentDetails';
import { services } from '../../services';

const AdminBookingDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [activities, setActivities] = useState([]);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [payment, setPayment] = useState(null);
  const [trackingData, setTrackingData] = useState([]); // Full history polyline data
  const [latestTrackingData, setLatestTrackingData] = useState(null); // Latest position
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trackingViewMode, setTrackingViewMode] = useState('fullRoute'); // 'fullRoute' | 'liveTracking'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingData, activityData, dispatchData, trackingResult, latestTrackingResult] = await Promise.all([
        services.bookings.getBookingById(id),
        services.bookings.getBookingActivity(id),
        services.bookings.getBookingDispatchLog(id),
        services.bookings.getBookingTracking(id),
        services.bookings.getBookingLatestTracking(id),
      ]);

      setBooking(bookingData);
      setActivities(activityData || []);
      setDispatchLogs(dispatchData || []);
      setPayment(bookingData.latestPayment || null);

      // Handle tracking data - ensure it's an array
      const trackingArray = Array.isArray(trackingResult) ? trackingResult :
        (trackingResult?.data && Array.isArray(trackingResult.data)) ? trackingResult.data : [];
      setTrackingData(trackingArray);

      // Handle latest tracking data - API returns data directly or full response
      if (latestTrackingResult && typeof latestTrackingResult === 'object' &&
        (latestTrackingResult.latitude !== undefined || latestTrackingResult.longitude !== undefined)) {
        setLatestTrackingData(latestTrackingResult);
      } else if (latestTrackingResult?.data && typeof latestTrackingResult.data === 'object' &&
        (latestTrackingResult.data.latitude !== undefined || latestTrackingResult.data.longitude !== undefined)) {
        setLatestTrackingData(latestTrackingResult.data);
      } else {
        setLatestTrackingData(null);
      }
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  // Fetch latest position only (used for live polling)
  const fetchLatestPosition = useCallback(async () => {
    try {
      const result = await services.bookings.getBookingLatestTracking(id);
      if (result && typeof result === 'object' &&
        (result.latitude !== undefined || result.longitude !== undefined)) {
        setLatestTrackingData(result);
      } else if (result?.data && typeof result.data === 'object' &&
        (result.data.latitude !== undefined || result.data.longitude !== undefined)) {
        setLatestTrackingData(result.data);
      }
    } catch {
      return;
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live polling ONLY when tracking tab is active AND mode is liveTracking
  useEffect(() => {
    if (activeTab !== 'tracking') return;

    let interval;

    if (trackingViewMode === 'liveTracking' && !loading) {
      interval = setInterval(() => {
        fetchLatestPosition();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trackingViewMode, activeTab, loading, fetchLatestPosition]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const tabs = [
    { id: 'overview', label: t('common.view'), icon: LayoutDashboard },
    { id: 'financials', label: t('finance.title'), icon: DollarSign },
    { id: 'timeline', label: t('bookings.activity.title'), icon: History },
    { id: 'dispatch', label: t('bookings.activity.dispatchLog'), icon: Send },
  ];

  if (payment) {
    tabs.push({ id: 'payment', label: t('payments.title'), icon: CreditCard });
  }

  if (booking.invoice) {
    tabs.push({ id: 'invoice', label: t('invoices.title'), icon: FileText });
  }

  // Show tracking tab if we have any tracking data (history or latest)
  // Temporarily always show for debugging
  const hasTrackingData = true; // (trackingData && trackingData.length > 0) || latestTrackingData;
  if (hasTrackingData) {
    tabs.push({ id: 'tracking', label: t('bookings.trackingTitle'), icon: Map });
  }

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(location.state?.from === 'live-tracking' ? '/admin/bookings/live' : '/admin/bookings')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-ink">{t('bookings.detailsTitle')}</h1>
          </div>
        </div>
      </div>

      <div className="flex border-b border-stroke overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-stroke'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && <BookingOverview booking={booking} latestTrackingData={latestTrackingData} />}
        {activeTab === 'financials' && <BookingFinancials booking={booking} />}
        {activeTab === 'timeline' && <BookingTimeline activities={activities} />}
        {activeTab === 'dispatch' && <BookingDispatchLog logs={dispatchLogs} />}
        {activeTab === 'payment' && <PaymentDetails payment={payment} onUpdate={fetchData} />}
        {activeTab === 'invoice' && <InvoiceDetails invoice={booking.invoice} />}
        {activeTab === 'tracking' && (
          <BookingMapView
            trackingPoints={trackingData}
            latestPosition={latestTrackingData}
            mode={trackingViewMode}
            onModeChange={setTrackingViewMode}
          />
        )}
      </div>
    </DirectionalWrapper>
  );
};

export default AdminBookingDetailPage;
