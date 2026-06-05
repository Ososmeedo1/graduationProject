import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, User, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import toast from 'react-hot-toast';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import BookingStatusBadge from '../../components/admin/bookings/BookingStatusBadge';
import { services } from '../../services';
import 'leaflet/dist/leaflet.css';

const createHelperMarker = (heading = 0) => {
  return divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(${heading}deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      border: 3px solid white;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L4.5 20.29C4.24 20.91 4.97 21.5 5.59 21.28L12 18L18.41 21.28C19.03 21.5 19.76 20.91 19.5 20.29L12 2Z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

const AdminLiveTrackingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);

  const fetchLiveBookings = useCallback(async () => {
    try {
      const result = await services.bookings.getLiveBookings();
      setActiveBookings(result || []);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLiveBookings();
    const interval = setInterval(fetchLiveBookings, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [fetchLiveBookings]);

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('bookings.liveTitle')}</h1>
          <p className="text-ink-muted">{t('bookings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Left Panel: Active Trips List */}
        <div className="lg:col-span-1 overflow-y-auto space-y-4 max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)
          ) : activeBookings.length === 0 ? (
            <Card className="p-8 text-center text-ink-muted">
              {t('common.noData')}
            </Card>
          ) : (
            activeBookings.map(booking => (
              <Card
                key={booking.bookingId}
                className="cursor-pointer hover:border-primary-400 transition-colors p-4"
                onClick={() => navigate(`/admin/bookings/${booking.bookingId}`, { state: { from: 'live-tracking' } })}
              >
                <div className="flex justify-between items-center mb-2">
                  <BookingStatusBadge status={booking.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User size={14} className="mr-2 text-ink-muted" />
                    <span className="text-ink-muted">{t('common.userName', 'User Name')}:</span>
                    <span className="ml-1 font-medium text-ink">{booking.userName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Navigation size={14} className="mr-2 text-ink-muted" />
                    <span className="text-ink-muted">{t('common.helperName', 'Helper Name')}:</span>
                    <span className="ml-1 font-medium text-primary-600">{booking.helperName}</span>
                  </div>
                  <div className="flex items-center text-xs text-ink-muted">
                    <MapPin size={12} className="mr-1" />
                    <span>{booking.destinationCity}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-ink-muted">
                    <span>{t('bookings.fields.type')}: <span className="font-medium text-ink">{booking.bookingType}</span></span>
                    <span>{t('bookings.fields.duration')}: <span className="font-medium text-ink">{booking.durationInMinutes} {t('common.minutes')}</span></span>
                  </div>
                  {booking.startedAt && (
                    <div className="flex items-center text-xs text-ink-muted">
                      <Clock size={12} className="mr-1" />
                      <span>{t('bookings.fields.startedAt')}: {new Date(booking.startedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-ink-muted">
                    <Navigation size={12} className="mr-1" />
                    <span>{t('bookings.fields.heading', 'Heading')}: </span>
                    <span className="ml-1 font-medium text-ink">
                      {booking.currentHeading !== null && booking.currentHeading !== undefined
                        ? `${booking.currentHeading.toFixed(1)}°`
                        : t('common.na', 'N/A')}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stroke flex justify-between items-center text-xs">
                    <span className="flex items-center text-ink-muted">
                      <Clock size={12} className="mr-1" />
                      {booking.lastLocationAt ? new Date(booking.lastLocationAt).toLocaleTimeString() : t('common.na', 'N/A')}
                    </span>
                    <span className="font-mono text-primary-600">
                      {booking.currentSpeedKmh !== null && booking.currentSpeedKmh !== undefined
                        ? `${booking.currentSpeedKmh.toFixed(1)} km/h`
                        : t('common.na', 'N/A')}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Panel: Interactive Map */}
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-full min-h-[500px]" />
          ) : activeBookings.length === 0 ? (
            <Card className="h-full bg-surface-inset flex flex-col items-center justify-center border-dashed border-2 min-h-[400px]">
              <div className="text-center p-6 md:p-12">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={40} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">{t('bookings.noActiveTrips', 'No Active Trips')}</h3>
                <p className="text-ink-muted max-w-md mx-auto">
                  {t('bookings.noActiveTripsDesc', 'No live bookings available to track')}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[500px]" title={t('bookings.liveMap', 'Live Map View')}>
              <div className="h-[500px] rounded-lg overflow-hidden border border-stroke">
                <MapContainer
                  center={
                    activeBookings
                      .filter(b => b.currentLatitude && b.currentLongitude)
                      .length > 0
                      ? [
                          activeBookings
                            .filter(b => b.currentLatitude && b.currentLongitude)
                            .reduce((sum, b) => sum + b.currentLatitude, 0) /
                          activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length,
                          activeBookings
                            .filter(b => b.currentLatitude && b.currentLongitude)
                            .reduce((sum, b) => sum + b.currentLongitude, 0) /
                          activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length,
                        ]
                      : [26.8206, 30.8025]
                  }
                  zoom={activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length > 0 ? 13 : 6}
                  className="h-full w-full"
                  zoomControl={true}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController
                    center={
                      activeBookings
                        .filter(b => b.currentLatitude && b.currentLongitude)
                        .length > 0
                        ? [
                            activeBookings
                              .filter(b => b.currentLatitude && b.currentLongitude)
                              .reduce((sum, b) => sum + b.currentLatitude, 0) /
                            activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length,
                            activeBookings
                              .filter(b => b.currentLatitude && b.currentLongitude)
                              .reduce((sum, b) => sum + b.currentLongitude, 0) /
                            activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length,
                          ]
                        : [26.8206, 30.8025]
                    }
                    zoom={activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length > 0 ? 13 : 6}
                  />

                  {/* Show markers for all active bookings with location data */}
                  {activeBookings
                    .filter(booking => booking.currentLatitude && booking.currentLongitude)
                    .map(booking => (
                      <Marker
                        key={booking.bookingId}
                        position={[booking.currentLatitude, booking.currentLongitude]}
                        icon={createHelperMarker(booking.currentHeading || 0)}
                        eventHandlers={{
                          click: () => navigate(`/admin/bookings/${booking.bookingId}`, { state: { from: 'live-tracking' } }),
                        }}
                      >
                        <Popup>
                          <div className="text-sm font-medium w-48">
                            <div className="mb-2">
                              <BookingStatusBadge status={booking.status} />
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="font-bold text-ink">{booking.userName}</p>
                              <p className="text-ink-muted">{t('common.helperName')}: {booking.helperName}</p>
                              <p className="text-ink-muted">{booking.destinationCity}</p>
                              <p className="text-ink-muted">
                                {booking.currentSpeedKmh !== null && booking.currentSpeedKmh !== undefined
                                  ? `Speed: ${booking.currentSpeedKmh.toFixed(1)} km/h`
                                  : 'Speed: N/A'}
                              </p>
                              <p className="text-primary-600 cursor-pointer hover:underline mt-2">
                                {t('common.viewDetails', 'View Details')} →
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
              <div className="mt-4 text-xs text-ink-muted">
                <p>
                  {t('bookings.activeTripsCount', 'Active Trips')}: {activeBookings.length} • 
                  {t('bookings.trackingTripsCount', 'With GPS')}: {activeBookings.filter(b => b.currentLatitude && b.currentLongitude).length}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DirectionalWrapper>
  );
};

export default AdminLiveTrackingPage;
