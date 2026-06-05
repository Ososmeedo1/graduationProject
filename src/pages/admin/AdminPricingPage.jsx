import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import { services } from '../../services';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';
import { formatDate } from '../../utils/formatters';

const emptyForm = {
  basePrice: '',
  pricePerKm: '',
  instantTripSurchargePercentage: '',
  rafiqCommissionPercentage: '',
  minimumTripPrice: '',
  currency: '',
};

const toFormValues = (settings = {}) => ({
  basePrice: settings.basePrice ?? '',
  pricePerKm: settings.pricePerKm ?? '',
  instantTripSurchargePercentage: settings.instantTripSurchargePercentage ?? '',
  rafiqCommissionPercentage: settings.rafiqCommissionPercentage ?? '',
  minimumTripPrice: settings.minimumTripPrice ?? '',
  currency: settings.currency ?? '',
});

const parseNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const AdminPricingPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.ADMIN_PRICING_VIEW);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await services.pricing.getPricingSettings();
      setSettings(data);
      setForm(toFormValues(data));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadSettings();
    }
  }, [canView]);

  const updatePayload = useMemo(() => ({
    basePrice: parseNumber(form.basePrice),
    pricePerKm: parseNumber(form.pricePerKm),
    instantTripSurchargePercentage: parseNumber(form.instantTripSurchargePercentage),
    rafiqCommissionPercentage: parseNumber(form.rafiqCommissionPercentage),
    minimumTripPrice: parseNumber(form.minimumTripPrice),
    currency: form.currency ? String(form.currency).trim() : undefined,
  }), [form]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canView) {
      toast.error(t('errors.forbidden', 'Access denied'));
      return;
    }

    try {
      setSaving(true);
      const updated = await services.pricing.updatePricingSettings(updatePayload);
      setSettings(updated);
      setForm(toFormValues(updated));
      toast.success(t('pricing.updateSuccess', 'Pricing settings updated'));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <AdminStateWrapper
        variant="forbidden"
        title={t('states.forbiddenTitle', 'Access Denied')}
        message={t('states.forbiddenView', 'You do not have permission to view this')}
      />
    );
  }

  return (
    <DirectionalWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('pricing.title', 'Pricing Settings')}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t('pricing.subtitle', 'Adjust base fares, surcharges, and commissions for the platform.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={t('pricing.form.title', 'Platform Pricing')}>
          {loading ? (
            <p className="text-sm text-ink-muted">{t('common.loading', 'Loading...')}</p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('pricing.basePrice', 'Base Price')}
                  value={form.basePrice}
                  onChange={handleChange('basePrice')}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('pricing.pricePerKm', 'Price per Km')}
                  value={form.pricePerKm}
                  onChange={handleChange('pricePerKm')}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('pricing.instantSurcharge', 'Instant Trip Surcharge %')}
                  value={form.instantTripSurchargePercentage}
                  onChange={handleChange('instantTripSurchargePercentage')}
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  label={t('pricing.rafiqCommission', 'Rafiq Commission %')}
                  value={form.rafiqCommissionPercentage}
                  onChange={handleChange('rafiqCommissionPercentage')}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('pricing.minimumTripPrice', 'Minimum Trip Price')}
                  value={form.minimumTripPrice}
                  onChange={handleChange('minimumTripPrice')}
                />
                <Input
                  type="text"
                  label={t('pricing.currency', 'Currency')}
                  value={form.currency}
                  onChange={handleChange('currency')}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" isLoading={saving}>
                  {t('common.saveChanges', 'Save Changes')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadSettings}
                  disabled={loading || saving}
                >
                  {t('common.refresh', 'Refresh')}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card title={t('pricing.summary.title', 'Current Summary')}>
          {loading ? (
            <p className="text-sm text-ink-muted">{t('common.loading', 'Loading...')}</p>
          ) : settings ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.updatedAt', 'Last Updated')}</p>
                <p className="font-medium text-ink">{formatDate(settings.updatedAt, 'medium') || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.currency', 'Currency')}</p>
                <p className="font-medium text-ink">{settings.currency || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.basePrice', 'Base Price')}</p>
                <p className="font-medium text-ink">{settings.basePrice}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.pricePerKm', 'Price per Km')}</p>
                <p className="font-medium text-ink">{settings.pricePerKm}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.minimumTripPrice', 'Minimum Trip Price')}</p>
                <p className="font-medium text-ink">{settings.minimumTripPrice}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.commission', 'Rafiq Commission %')}</p>
                <p className="font-medium text-ink">{settings.rafiqCommissionPercentage}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('pricing.summary.surcharge', 'Instant Surcharge %')}</p>
                <p className="font-medium text-ink">{settings.instantTripSurchargePercentage}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</p>
          )}
        </Card>
      </div>
    </DirectionalWrapper>
  );
};

export default AdminPricingPage;
