import axios from './axios';

const pickFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeEnvelope = (payload) => payload?.data?.data || payload?.data || payload || {};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePricingSettings = (payload = {}) => {
  const data = normalizeEnvelope(payload);

  return {
    basePrice: toNumber(pickFirstDefined(data.basePrice, data.BasePrice)),
    pricePerKm: toNumber(pickFirstDefined(data.pricePerKm, data.PricePerKm)),
    instantTripSurchargePercentage: toNumber(
      pickFirstDefined(data.instantTripSurchargePercentage, data.InstantTripSurchargePercentage)
    ),
    rafiqCommissionPercentage: toNumber(
      pickFirstDefined(data.rafiqCommissionPercentage, data.RafiqCommissionPercentage)
    ),
    minimumTripPrice: toNumber(pickFirstDefined(data.minimumTripPrice, data.MinimumTripPrice)),
    currency: pickFirstDefined(data.currency, data.Currency, ''),
    updatedAt: pickFirstDefined(data.updatedAt, data.UpdatedAt, ''),
    updatedByAdminId: pickFirstDefined(data.updatedByAdminId, data.UpdatedByAdminId, null),
  };
};

const buildUpdatePayload = (input = {}) => {
  const payload = {
    basePrice: input.basePrice,
    pricePerKm: input.pricePerKm,
    instantTripSurchargePercentage: input.instantTripSurchargePercentage,
    rafiqCommissionPercentage: input.rafiqCommissionPercentage,
    minimumTripPrice: input.minimumTripPrice,
    currency: input.currency,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

export const getPricingSettings = async () => {
  const payload = await axios.get('/admin/pricing/settings');
  return normalizePricingSettings(payload);
};

export const updatePricingSettings = async (input = {}) => {
  const payload = await axios.put('/admin/pricing/settings', buildUpdatePayload(input));
  return normalizePricingSettings(payload);
};
