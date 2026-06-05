import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Shield, User } from 'lucide-react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

const SubmitButton = ({ isEdit }) => {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${pending ? 'animate-pulse' : ''}`}
    >
      {pending ? t('common.loading', 'Loading...') : isEdit ? t('common.save', 'Save') : t('common.create', 'Create')}
    </button>
  );
};

const initialState = {
  errors: {},
};

const UserForm = ({ initialValues, isEdit, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const roleOptions = [
    { value: 'Admin', label: t('roles.admin', 'Admin') },
    { value: 'SuperAdmin', label: t('roles.superAdmin', 'SuperAdmin') },
  ];

  const statusOptions = [
    { value: 'active', label: t('common.active', 'Active') },
    { value: 'inactive', label: t('common.inactive', 'Inactive') },
  ];

  const validate = (payload, isEditForm) => {
    const errors = {};

    if (!payload.fullName?.trim()) errors.fullName = t('validation.required', 'Required field');
    if (!payload.email?.trim()) errors.email = t('validation.required', 'Required field');
    if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) errors.email = t('validation.email', 'Invalid email');
    if (!payload.role) errors.role = t('validation.required', 'Required field');
    if (!payload.status) errors.status = t('validation.required', 'Required field');
    if (!isEditForm && !payload.password?.trim()) errors.password = t('validation.required', 'Required field');

    return errors;
  };

  const [formState, submitAction] = useActionState(async (_prevState, formData) => {
    const payload = {
      fullName: formData.get('fullName') || '',
      email: formData.get('email') || '',
      role: formData.get('role') || 'Admin',
      status: formData.get('status') || 'active',
      password: formData.get('password') || '',
    };

    const errors = validate(payload, isEdit);
    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    await onSubmit(payload);
    return { errors: {} };
  }, initialState);

  return (
    <form action={submitAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          name="fullName"
          label={t('users.name', 'Name')}
          defaultValue={initialValues?.fullName || ''}
          error={formState.errors.fullName}
          icon={<User size={18} />}
        />
        <Input
          name="email"
          type="email"
          label={t('users.email', 'Email')}
          defaultValue={initialValues?.email || ''}
          error={formState.errors.email}
          icon={<Mail size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          name="role"
          label={t('users.role', 'Role')}
          defaultValue={initialValues?.role || 'Admin'}
          options={roleOptions}
          error={formState.errors.role}
        />
        <Select
          name="status"
          label={t('users.status', 'Status')}
          defaultValue={initialValues?.isActive === false ? 'inactive' : 'active'}
          options={statusOptions}
          error={formState.errors.status}
        />
      </div>

      <Input
        name="password"
        type="password"
        label={isEdit ? t('users.newPassword', 'New Password (optional)') : t('auth.password', 'Password')}
        error={formState.errors.password}
        icon={<Shield size={18} />}
      />

      <div className="flex items-center justify-end gap-2 border-t border-stroke pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
        >
          {t('common.cancel', 'Cancel')}
        </button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
};

export default UserForm;
