import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { Navigation, Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './BookingMapView.css';

const createHelperIcon = (heading = 0) => {
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

const createEndpointIcon = () => {
  return divIcon({
    className: 'endpoint-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: #10b981;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
};

const BookingMapView = ({
  trackingPoints = [],
  latestPosition = null,
  mode = 'fullRoute',
  isLoading = false,
  onModeChange,
  showOnlyCurrentLocation = false
}) => {
  const { t } = useTranslation();

  // Prepare polyline coordinates from history
  const routeCoordinates = trackingPoints?.length > 0
    ? trackingPoints.map(p => [p.latitude, p.longitude])
    : [];

  // Get last point for endpoint marker
  const lastPoint = trackingPoints?.length > 0
    ? [
      trackingPoints[trackingPoints.length - 1].latitude,
      trackingPoints[trackingPoints.length - 1].longitude
    ]
    : null;

  // Center map: prefer latest position, fallback to first history point
  const mapCenter = latestPosition?.latitude && latestPosition?.longitude
    ? [latestPosition.latitude, latestPosition.longitude]
    : (trackingPoints[0] ? [trackingPoints[0].latitude, trackingPoints[0].longitude] : [0, 0]);

  const helperIcon = latestPosition ? createHelperIcon(latestPosition.heading || 0) : null;
  const endpointIcon = createEndpointIcon();

  const handleModeChange = (newMode) => {
    onModeChange?.(newMode);
  };

  return (
    <Card
      title={showOnlyCurrentLocation ? t('bookings.currentLocation') : t('bookings.trackingTitle')}
      actions={
        !showOnlyCurrentLocation && (
          <div className="flex gap-2">
            <Button
              variant={mode === 'fullRoute' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleModeChange('fullRoute')}
            >
              <span className="mr-2"><Map size={16} /></span>
              {t('bookings.fullRouteMode')}
            </Button>
            <Button
              variant={mode === 'liveTracking' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleModeChange('liveTracking')}
            >
              <span className="mr-2"><Navigation size={16} /></span>
              {t('bookings.liveTrackingMode')}
            </Button>
          </div>
        )
      }
    >
      {isLoading && trackingPoints?.length === 0 && !showOnlyCurrentLocation ? (
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-ink-muted">{t('common.loading')}</p>
          </div>
        </div>
      ) : trackingPoints?.length === 0 && !latestPosition && !showOnlyCurrentLocation ? (
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-ink-muted">{t('bookings.noTrackingData')}</p>
        </div>
      ) : !latestPosition && showOnlyCurrentLocation ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-ink-muted">{t('bookings.noLocationData')}</p>
        </div>
      ) : (
        <>
          <div className={`${showOnlyCurrentLocation ? 'h-[400px]' : 'h-[500px]'} rounded-lg overflow-hidden border border-stroke`}>
            <MapContainer
              center={mapCenter}
              zoom={showOnlyCurrentLocation ? 17 : 15}
              className="h-full w-full"
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} zoom={showOnlyCurrentLocation ? 17 : 15} />

              {/* Always show route polyline when history exists */}
              {!showOnlyCurrentLocation && trackingPoints?.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="#6366f1"
                  weight={4}
                  opacity={0.8}
                  dashArray="10, 10"
                />
              )}

              {/* Full Route Mode: Show endpoint marker */}
              {!showOnlyCurrentLocation && mode === 'fullRoute' && lastPoint && (
                <Marker position={lastPoint} icon={endpointIcon} />
              )}

              {/* Live Tracking Mode or Current Location Only: Show moving marker */}
              {(showOnlyCurrentLocation || mode === 'liveTracking') && latestPosition?.latitude && latestPosition?.longitude && (
                <Marker
                  position={[latestPosition.latitude, latestPosition.longitude]}
                  icon={helperIcon}
                />
              )}
            </MapContainer>
          </div>

          {/* Status bar */}
          {!showOnlyCurrentLocation && (
            <div className="mt-4 text-sm text-ink-muted">
              {mode === 'fullRoute' ? (
                <span>
                  <Map size={14} className="inline mr-1" />
                  {t('bookings.fullRouteModeActive')}
                  {trackingPoints?.length > 0 && ` • ${trackingPoints.length} ${t('bookings.pointsCount')}`}
                </span>
              ) : (
                <span>
                  <Navigation size={14} className="inline mr-1" />
                  {t('bookings.liveTrackingModeActive')}
                  {latestPosition && ` • ${t('bookings.lastUpdate')}: ${new Date(latestPosition.timestamp).toLocaleTimeString()}`}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default BookingMapView;
