import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Skeleton from '../../components/ui/Skeleton';
import SosStatusBadge from '../../components/admin/sos/SosStatusBadge';
import { services } from '../../services';
import { formatDate } from '../../utils/formatters';
import useAlert from '../../hooks/useAlert';

const createSosMarker = () => divIcon({
  className: 'sos-marker',
  html: `<div style="
    width: 18px;
    height: 18px;
    background: #ef4444;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.45);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: false });
    }
  }, [center, map]);
  return null;
};

const AdminSosDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { prompt } = useAlert();

  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  const fetchSos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.sos.getSosById(id);
      setSos(data);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
      navigate('/admin/sos');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    fetchSos();
  }, [fetchSos]);

  const handleResolve = async () => {
    // For production-grade interaction, we need a custom form.
    // Simplifying into a prompt flow that handles the required fields.
    const resolution = await prompt({
      title: t('sos.resolveDialog.title'),
      message: t('sos.resolveDialog.message'),
      placeholder: t('sos.resolveDialog.notePlaceholder'),
      confirmText: t('sos.actions.resolve'),
      type: 'primary',
      // Enhancement: In production, pass options for status/action here
    });

    if (resolution === null) return;

    try {
      setResolving(true);
      const updatedSos = await services.sos.resolveSos(id, {
        finalStatus: 'Handled', // Default for now
        resolutionNote: resolution,
        action: 'ManualResolution', // Default action
      });
      setSos(updatedSos);
      toast.success(t('common.updateSuccess'));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed'));
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!sos) return null;

  const latitude = Number(sos.latitude);
  const longitude = Number(sos.longitude);
  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapCenter = hasLocation ? [latitude, longitude] : [0, 0];
  const sosMarker = createSosMarker();

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/admin/sos')} icon={ArrowLeft}>
          {t('common.back')}
        </Button>
        {sos.status === 'Active' && (
          <Button variant="primary" onClick={handleResolve} loading={resolving} icon={CheckCircle2}>
            {t('sos.actions.resolve')}
          </Button>
        )}
      </div>

      <Card title={t('sos.detailsTitle')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-ink-muted">{t('sos.fields.triggererName')}</p>
            <p className="font-medium text-ink">{sos.triggeredByName}</p>
            <p className="text-xs text-ink-muted">{sos.triggeredByContact}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">{t('sos.fields.counterpartyName')}</p>
            <p className="font-medium text-ink">{sos.counterpartyName}</p>
            <p className="text-xs text-ink-muted">{sos.counterpartyContact}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">{t('sos.fields.status')}</p>
            <SosStatusBadge status={sos.status} />
          </div>

          <div className="md:col-span-3 border-t pt-4">
            <p className="text-sm text-ink-muted">{t('sos.fields.reason')}</p>
            <p className="p-3 bg-surface-inset rounded border border-stroke text-ink">{sos.reason}</p>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm text-ink-muted">{t('sos.fields.locationPreview', 'Location preview')}</p>
            <div className="mt-2 h-[260px] rounded-lg overflow-hidden border border-stroke bg-surface-inset">
              {hasLocation ? (
                <MapContainer
                  key={`${latitude}-${longitude}`}
                  center={mapCenter}
                  zoom={14}
                  className="h-full w-full"
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController center={mapCenter} />
                  <Marker position={mapCenter} icon={sosMarker} />
                </MapContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-ink-muted">
                  {t('sos.fields.locationUnavailable', 'Location data unavailable')}
                </div>
              )}
            </div>
          </div>

          {sos.status === 'Handled' && (
            <div className="md:col-span-2">
              <p className="text-sm text-ink-muted">{t('sos.fields.resolution')}</p>
              <p className="text-sm text-ink">{sos.resolutionAction} - {sos.resolutionNote}</p>
              <p className="text-xs text-ink-muted">{t('sos.fields.resolvedAt')}: {formatDate(sos.resolvedAt, 'medium')}</p>
            </div>
          )}
        </div>
      </Card>
    </DirectionalWrapper>
  );
};

export default AdminSosDetailPage;
