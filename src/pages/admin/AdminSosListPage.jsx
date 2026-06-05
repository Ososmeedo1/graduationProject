import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Button from '../../components/ui/Button';
import SosTable from '../../components/admin/sos/SosTable';
import SosStatsCards from '../../components/admin/sos/SosStatsCards';
import { services } from '../../services';

const AdminSosListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [sosStats, setSosStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });

  const fetchSos = useCallback(async () => {
    try {
      setLoading(true);
      const result = await services.sos.getSosList({ Page: pagination.page, PageSize: pagination.limit });
      setData(result.items || []);
      setPagination((prev) => ({
        totalPages: Math.ceil(result.total / prev.limit) || 1,
      }));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, t]);

  const fetchSosStats = useCallback(async () => {
    try {
      const stats = await services.sos.getSosStats();
      setSosStats(stats);
    } catch {
      setSosStats(null);
    }
  }, []);

  useEffect(() => {
    fetchSos();
  }, [fetchSos]);

  useEffect(() => {
    fetchSosStats();
  }, [fetchSosStats]);

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('sos.title')}</h1>
          <p className="text-ink-muted">{t('sos.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/admin/sos/live')} variant="danger" icon={AlertTriangle}>
          {t('sos.liveTitle')}
        </Button>
      </div>

      <SosStatsCards sosStats={sosStats} />

      <div className="bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
        <SosTable data={data} isLoading={loading} onView={(sos) => navigate(`/admin/sos/${sos.id}`)} />
      </div>
    </DirectionalWrapper>
  );
};

export default AdminSosListPage;
