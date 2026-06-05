import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import Input from '../ui/Input';
import Button from '../ui/Button';

const FormDirtyListener = ({ onDirtyChange }) => {
  const { dirty } = useFormikContext();

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(dirty);
    }
  }, [dirty, onDirtyChange]);

  return null;
};

const toSkillsArray = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const HelperForm = ({ initialValues, onSubmit, isSubmitting, onCancel, onDirtyChange }) => {
  const { t } = useTranslation();

  const initialSkillsText = Array.isArray(initialValues?.skills)
    ? initialValues.skills.join(', ')
    : initialValues?.skillsText || '';

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required(t('validation.required')),
    email: Yup.string().email(t('validation.email')).required(t('validation.required')),
    phone: Yup.string().required(t('validation.required')),
  });

  const defaultValues = {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    hasCar: false,
    hasDrugTest: false,
    ...initialValues,
    skillsText: initialSkillsText,
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const payload = {
          ...values,
          skills: toSkillsArray(values.skillsText),
        };
        delete payload.skillsText;
        onSubmit(payload);
      }}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form className="space-y-4">
          <FormDirtyListener onDirtyChange={onDirtyChange} />
          <Input
            label={t('helpers.fields.name', 'Full Name')}
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fullName && errors.fullName}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('helpers.fields.email', 'Email')}
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
            />
            <Input
              label={t('helpers.fields.phone', 'Phone Number')}
              name="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone && errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('helpers.fields.city', 'City')}
              name="city"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.city && errors.city}
            />
            <Input
              label={t('helpers.fields.district', 'District')}
              name="district"
              value={values.district}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.district && errors.district}
            />
          </div>

          <Input
            label={t('helpers.fields.skills', 'Skills (comma separated)')}
            name="skillsText"
            value={values.skillsText}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                name="hasCar"
                checked={Boolean(values.hasCar)}
                onChange={handleChange}
                className="h-4 w-4 rounded border-stroke bg-surface text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-ink">{t('helpers.fields.hasCar', 'Has Car')}</span>
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                name="hasDrugTest"
                checked={Boolean(values.hasDrugTest)}
                onChange={handleChange}
                className="h-4 w-4 rounded border-stroke bg-surface text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-ink">{t('helpers.fields.hasDrugTest', 'Drug Test Provided')}</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => (onCancel ? onCancel() : window.history.back())}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {t('common.save', 'Save Changes')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default HelperForm;
