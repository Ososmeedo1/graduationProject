import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import UserTable from '../../components/users/UserTable';
import * as userApi from '../../services/api/userApi';
import toast from 'react-hot-toast';
import useAlert from '../../hooks/useAlert';

const userService = userApi;

const UserListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { confirm } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getUsers({ search });
      setUsers(data);
    } catch {
      toast.error(t('users.loadError', 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user) => {
    const confirmed = await confirm({
      title: t('users.deleteTitle', 'Delete User'),
      message: t('users.deleteConfirm', 'Are you sure you want to delete "{{name}}"? This action cannot be undone.', { name: user.name }),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });

    if (confirmed) {
      try {
        await userService.deleteUser(user.id);
        toast.success(t('common.deletedSuccess', 'User deleted successfully'));
        fetchUsers();
      } catch {
        toast.error(t('common.deleteError', 'Failed to delete user'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-ink">{t('users.title', 'Users')}</h1>
        <Button onClick={() => navigate('/users/new')}>
          <Plus size={20} className="mr-2" />
          {t('users.addNew', 'New User')}
        </Button>
      </div>

      <div className="bg-surface p-4 rounded-lg shadow-sm border border-stroke mb-6">
        <Input
          placeholder={t('users.searchPlaceholder', 'Search users by name or email...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={18} />}
          className="max-w-md"
        />
      </div>

      <UserTable
        data={users}
        isLoading={loading}
        onEdit={(user) => navigate(`/users/${user.id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UserListPage;
