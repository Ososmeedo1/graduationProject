import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color = 'primary' }) => {
  const { t } = useTranslation();
  const { motionEnabled } = useTheme();
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-ink-muted';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  const colorClasses = {
    primary: 'bg-primary-500/10 text-primary-600',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    danger: 'bg-red-500/10 text-red-600',
    info: 'bg-blue-500/10 text-blue-600',
  };

  const iconMotionClasses = motionEnabled
    ? 'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'
    : '';

  return (
    <Card className="h-full group animate-fadeInUp">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-muted uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-ink tracking-tight">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-2xl shadow-sm ${iconMotionClasses} ${colorClasses[color]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {trendValue && (
        <div className="mt-5 flex items-center text-sm">
          <div className="flex items-center px-2 py-1 rounded-full bg-surface-inset border border-stroke/60">
            <TrendIcon className={`w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1 ${trendColor}`} />
            <span className={`font-semibold ${trendColor}`}>{trendValue}</span>
          </div>
          <span className="ml-2 rtl:ml-0 rtl:mr-2 text-ink-muted font-medium text-xs uppercase tracking-wider">
            {t('dashboard.vsLastPeriod', 'vs last period')}
          </span>
        </div>
      )}
    </Card>
  );
};

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
};

export default KPICard;
