import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldAlert, Clock3, UserCheck, XCircle, Ban } from 'lucide-react';
import KPICard from '../../dashboard/KPICard';
import Card from '../../ui/Card';

const SosStatsCards = ({ sosStats }) => {
  const { t } = useTranslation();

  if (!sosStats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title={t('sos.stats.total', 'Total SOS')}
          value={sosStats.total || 0}
          icon={AlertTriangle}
          color="danger"
        />
        <KPICard
          title={t('sos.stats.active', 'Active')}
          value={sosStats.active || 0}
          icon={ShieldAlert}
          color="danger"
        />
        <KPICard
          title={t('sos.stats.handled', 'Handled')}
          value={sosStats.handled || 0}
          icon={UserCheck}
          color="success"
        />
        <KPICard
          title={t('sos.stats.falseAlarm', 'False Alarm')}
          value={sosStats.falseAlarm || 0}
          icon={XCircle}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(sosStats.cancelled !== undefined || sosStats.last24h !== undefined) && (
          <Card title={t('sos.stats.cancelled', 'Cancellation Stats')}>
            <ul className="space-y-2">
              {sosStats.cancelled !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('sos.stats.cancelled', 'Cancelled')}</span>
                  <span className="font-medium text-ink">{sosStats.cancelled}</span>
                </li>
              )}
              {sosStats.last24h !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('sos.stats.last24h', 'Last 24H')}</span>
                  <span className="font-medium text-ink">{sosStats.last24h}</span>
                </li>
              )}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SosStatsCards;
