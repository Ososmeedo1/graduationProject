import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import HelperForm from '../../components/helpers/HelperForm';
import { services } from '../../services';
import toast from 'react-hot-toast';
import useAlert from '../../hooks/useAlert';

const HelperFormPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { confirm } = useAlert();
  const isEditMode = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchHelper = async () => {
        try {
          const data = await services.helpers.getHelperById(id);
          setInitialValues(data);
        } catch {
          toast.error(t('errors.fetchFailed', 'Failed to load helper'));
          navigate('/helpers');
        } finally {
          setLoading(false);
        }
      };
      fetchHelper();
    }
  }, [id, isEditMode, navigate, t]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await services.helpers.updateHelper(id, values);
        toast.success(t('helpers.updateSuccess', 'Helper updated successfully'));
      } else {
        await services.helpers.createHelper(values);
        toast.success(t('helpers.createSuccess', 'Helper created successfully'));
      }
      navigate('/helpers');
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to save helper'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = async () => {
    if (!isDirty) {
      navigate('/helpers');
      return;
    }

    const confirmed = await confirm({
      title: t('common.unsavedChangesTitle', 'Unsaved Changes'),
      message: t('common.unsavedChangesMessage', 'You have unsaved changes. Discard them and leave?'),
      type: 'warning',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });

    if (confirmed) {
      navigate('/helpers');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading', 'Loading...')}</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleExit}>
          <ArrowLeft size={20} className="mr-2" />
          {t('common.back', 'Back')}
        </Button>
        <h1 className="text-2xl font-bold text-ink">
          {isEditMode ? t('helpers.editTitle', 'Edit Helper') : t('helpers.createTitle', 'New Helper')}
        </h1>
      </div>

      <Card>
        <HelperForm
          initialValues={initialValues || {}}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          onCancel={handleExit}
          onDirtyChange={setIsDirty}
        />
      </Card>
    </div>
  );
};

export default HelperFormPage;
