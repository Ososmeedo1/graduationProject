import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import SosStatusBadge from '../../components/admin/sos/SosStatusBadge';
import { services } from '../../services';
import { formatDate } from '../../utils/formatters';

const AdminSosLiveBoardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSos, setActiveSos] = useState([]);

  const fetchActiveSos = useCallback(async () => {
    try {
      const result = await services.sos.getActiveSos(50);
      setActiveSos(result.items || []);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchActiveSos();
    const interval = setInterval(fetchActiveSos, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, [fetchActiveSos]);

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('sos.liveTitle')}</h1>
          <p className="text-ink-muted">{t('sos.subtitle')}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/sos')} icon={ArrowLeft}>
          {t('common.back')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)
        ) : activeSos.length === 0 ? (
          <Card className="col-span-full p-8 text-center text-ink-muted">
            {t('common.noData')}
          </Card>
        ) : (
          activeSos.map(sos => (
            <Link to={'/admin/sos/' + sos.id} key={sos.id} className="block">
              <Card className="border-l-4 border-l-danger-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-danger-600 font-bold">
                    <AlertTriangle size={20} />
                    {t('sos.status.active')}
                  </div>
                  <SosStatusBadge status={sos.status} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User size={16} className="mr-2 text-ink-muted" />
                    <span className="font-medium text-ink">{sos.triggeredByName}</span>
                  </div>
                  <div className="text-xs text-ink-muted mb-2">{sos.triggeredByContact}</div>
                  <div className="p-3 bg-surface-inset rounded text-sm text-ink">
                    <p className="font-medium mb-1">{t('sos reason')}:</p>
                    <p>{sos.reason}</p>
                  </div>
                  <div className="text-xs text-ink-muted flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatDate(sos.createdAt, 'full')}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </DirectionalWrapper>
  );
};

export default AdminSosLiveBoardPage;
