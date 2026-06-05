import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, AlertCircle } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import useAlert from '../../hooks/useAlert';

const UserForm = ({ initialValues, onSubmit, isEdit, isLoading }) => {
  const { t } = useTranslation();
  const { confirm } = useAlert();

  const validationSchema = Yup.object({
    name: Yup.string().required(t('validation.required', 'Required')),
    email: Yup.string().email(t('validation.email', 'Invalid email')).required(t('validation.required', 'Required')),
    role: Yup.string().required(t('validation.required', 'Required')),
    status: Yup.string().required(t('validation.required', 'Required')),
    password: isEdit
      ? Yup.string().min(6, t('validation.minLength', 'Min 6 chars'))
      : Yup.string().min(6, t('validation.minLength', 'Min 6 chars')).required(t('validation.required', 'Required')),
  });

  const normalizedInitialValues = initialValues || {
    name: '',
    email: '',
    role: 'admin',
    status: 'active',
    password: '',
  };

  const formik = useFormik({
    initialValues: normalizedInitialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, helpers) => {
      if (isEdit && values.role !== normalizedInitialValues.role) {
        const confirmed = await confirm({
          title: t('users.roleChangeTitle', 'Change Role'),
          message: t('users.roleChangeMessage', 'You are changing the user role. Continue?'),
          type: 'warning',
          confirmText: t('common.confirm'),
          cancelText: t('common.cancel'),
        });

        if (!confirmed) {
          helpers.setSubmitting(false);
          return;
        }
      }

      await onSubmit(values, helpers);
    },
  });

  const roleOptions = [
    { value: 'admin', label: 'Admin (Full Access)' },
    { value: 'superadmin', label: 'Super Admin (System-wide Access)' },
  ];

  const statusOptions = [
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'inactive', label: t('status.inactive', 'Inactive') },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card title={isEdit ? t('users.editTitle', 'Edit User') : t('users.createTitle', 'Create User')}>

        {isEdit && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('users.editWarning', 'Changing user roles may affect their access immediately. Updates to email will require re-login.')}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label={t('users.fields.name', 'Full Name')}
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            icon={<User size={18} />}
          />

          <Input
            label={t('users.fields.email', 'Email Address')}
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
            icon={<Mail size={18} />}
          />

          <Select
            label={t('users.fields.role', 'Role')}
            name="role"
            options={roleOptions}
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.role && formik.errors.role}
          />

          <Select
            label={t('users.fields.status', 'Status')}
            name="status"
            options={statusOptions}
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.status && formik.errors.status}
          />

          <div className="pt-4 border-t border-stroke">
            <h4 className="text-sm font-medium text-ink mb-4">{t('auth.security', 'Security')}</h4>
            <Input
              label={isEdit ? t('users.fields.newPassword', 'New Password (Leave blank to keep)') : t('users.fields.password', 'Password')}
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              icon={<Shield size={18} />}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? t('common.saveChanges', 'Save Changes') : t('common.create', 'Create User')}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default UserForm;
