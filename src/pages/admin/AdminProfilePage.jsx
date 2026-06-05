import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import { services } from '../../services';

const extractProfile = (payload) => payload?.data?.data || payload?.data || payload || {};

const AdminProfilePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await services.auth.me();
        if (!cancelled) {
          setProfile(extractProfile(response));
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.detail || err?.message || t('errors.fetchFailed', 'Failed to fetch data'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('validation.required', 'This field is required'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('validation.passwordMatch', 'Passwords do not match'));
      return;
    }

    try {
      setSubmitting(true);
      await services.auth.changePassword(currentPassword, newPassword);
      toast.success(t('profile.passwordChanged', 'Password changed successfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.detail || err?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DirectionalWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('nav.admin_profile', 'Profile')}</h1>
        <p className="mt-1 text-sm font-medium text-ink-muted">
          {t('profile.welcome', 'Welcome, {{name}}', { name: profile?.fullName || profile?.name || 'Admin' })}
        </p>
        <p className="mt-1 text-sm text-ink-muted">{t('profile.subtitle', 'Manage your account information and security settings.')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-ink">{t('profile.account', 'Profile')}</h2>
          {loading ? (
            <p className="text-sm text-ink-muted">{t('common.loading', 'Loading...')}</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-ink-muted">{t('common.email', 'Email')}</p>
                <p className="font-medium text-ink">{profile?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('profile.username', 'Username')}</p>
                <p className="font-medium text-ink">{profile?.username || profile?.userName || profile?.fullName || profile?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">{t('users.role', 'Role')}</p>
                <p className="font-medium text-ink">{profile?.role || '-'}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink">{t('profile.changePassword', 'Change Password')}</h2>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <Input
              type="password"
              label={t('profile.currentPassword', 'Current Password')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              label={t('profile.newPassword', 'New Password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              label={t('profile.confirmPassword', 'Confirm New Password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="pt-1">
              <Button type="submit" isLoading={submitting}>
                {t('profile.saveChanges', 'Save Changes')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DirectionalWrapper>
  );
};

export default AdminProfilePage;