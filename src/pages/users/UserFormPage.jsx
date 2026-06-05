import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserForm from '../../components/users/UserForm';
import * as userApi from '../../services/api/userApi';
import toast from 'react-hot-toast';

const userService = userApi;

const UserFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const user = await userService.getUserById(id);
          setInitialValues({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            password: '', // Don't verify password on edit
          });
        } catch {
          toast.error(t('users.loadError', 'Failed to load user details'));
          navigate('/users');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEdit, navigate, t]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        // Remove password if empty to avoid overwriting
        const updateData = { ...values };
        if (!updateData.password) delete updateData.password;

        await userService.updateUser(id, updateData);
        toast.success(t('common.updatedSuccess', 'User updated successfully'));
      } else {
        await userService.createUser(values);
        toast.success(t('common.createdSuccess', 'User created successfully'));
      }
      navigate('/users');
    } catch {
      toast.error(isEdit ? t('common.updateError', 'Update failed') : t('common.createError', 'Creation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">
        {isEdit ? t('users.editUser', 'Edit User') : t('users.newUser', 'New User')}
      </h1>
      <div className="max-w-xl">
        <UserForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      </div>
    </div>
  );
};

export default UserFormPage;
