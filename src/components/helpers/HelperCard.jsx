import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Edit, Trash, Eye, Car, ShieldCheck, ShieldX } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HelperStatusBadge from '../admin/management/HelperStatusBadge';

const HelperCard = ({ helper, onView }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {(helper.fullName || helper.email || '?').charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">{helper.fullName || t('helpers.unknown', 'Unknown')}</h3>
            <HelperStatusBadge status={helper.approvalStatus || helper.status} />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-ink-muted">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-ink-muted" />
          <span className="truncate">{helper.email || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-ink-muted" />
          <span>{helper.phone || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car size={16} className="text-ink-muted" />
          <span>{helper.hasCar ? t('helpers.hasCarYes', 'Has car') : t('helpers.hasCarNo', 'No car')}</span>
        </div>
        <div className="flex items-center gap-2">
          {helper.hasDrugTest ? <ShieldCheck size={16} className="text-green-500 dark:text-green-400" /> : <ShieldX size={16} className="text-ink-muted" />}
          <span>{helper.hasDrugTest ? t('helpers.hasDrugTest', 'Drug test provided') : t('helpers.noDrugTest', 'No drug test')}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-stroke bg-surface-muted -mx-6 -mb-6 p-4 rounded-b-lg">
        <Button variant="outline" size="sm" className="flex-1 justify-center" onClick={() => onView(helper)}>
          <Eye size={16} className="mr-2" />
          {t('common.view')}
        </Button>
      </div>
    </Card>
  );
};

export default HelperCard;
