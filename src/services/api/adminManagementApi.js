import axios from './axios';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.data?.items)) return payload.data.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const toAdminRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'admin') return 'Admin';
  if (value === 'superadmin' || value === 'super_admin' || value === 'super-admin') return 'SuperAdmin';
  return 'Admin';
};

const toUiRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'superadmin' || value === 'super_admin' || value === 'super-admin') return 'SuperAdmin';
  return 'Admin';
};

const normalizeUser = (user = {}) => ({
  id: user.id,
  fullName: user.fullName || user.name || '',
  email: user.email || '',
  role: toUiRole(user.role),
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeHelper = (helper = {}) => {
  const status = helper.approvalStatus || helper.status || 'Pending';
  return {
    id: helper.id || helper.helperId,
    helperId: helper.helperId,
    fullName: helper.fullName || helper.name || '',
    email: helper.email || helper.userEmail || helper.userEmailAddress || '',
    phone: helper.phone || helper.phoneNumber || helper.userPhone || '',
    city: helper.city || '',
    district: helper.district || '',
    skills: helper.skills || [],
    approvalStatus: status,
    isApproved: helper.isApproved === true,
    isActive: helper.isActive === true,
    isBanned: helper.isBanned === true,
    isSuspended: helper.isSuspended === true,
    createdAt: helper.createdAt,
    onboardingStatus: helper.onboardingStatus,
    completedSteps: helper.completedSteps,
    missingSteps: helper.missingSteps,
    hasCar: helper.hasCar ?? helper.hasVehicle ?? helper.hasPrivateVehicle,
    hasDrugTest: helper.hasDrugTest,
    languageCount: helper.languageCount,
    languages: helper.languages || [],
    certificates: helper.certificates || [],
    gender: helper.gender,
    birthDate: helper.birthDate,
    profileImageUrl: helper.profileImageUrl,
    selfieImageUrl: helper.selfieImageUrl,
    nationalIdFront: helper.nationalIdFront,
    nationalIdBack: helper.nationalIdBack,
    criminalRecordFile: helper.criminalRecordFile,
    currentDrugTest: helper.currentDrugTest,
    car: helper.car,
    banReason: helper.banReason,
    bannedAt: helper.bannedAt,
    suspensionReason: helper.suspensionReason,
    suspendedAt: helper.suspendedAt,
    rejectionReason: helper.rejectionReason,
  };
};

const normalizeHelperStatus = (helper = {}) => {
  if (helper.isBanned) return 'Banned';
  if (helper.isSuspended) return 'Suspended';
  if (helper.isApproved || helper.isActive) return 'Active';
  if ((helper.approvalStatus || '').toLowerCase() === 'rejected') return 'Rejected';
  if ((helper.approvalStatus || '').toLowerCase() === 'underreview') return 'UnderReview';
  if ((helper.approvalStatus || '').toLowerCase() === 'changesrequested') return 'ChangesRequested';
  return helper.approvalStatus || 'Pending';
};

const runHelperAction = async (helperId, actionPath, body) => {
  return axios.post(`/admin/helpers/${helperId}/${actionPath}`, body);
};

export const getUsers = async () => {
  const payload = await axios.get('/admin/admins');
  return toArray(payload).map(normalizeUser);
};

export const getUserById = async (id) => {
  const users = await getUsers();
  const user = users.find((item) => item.id === id);

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
};

export const createUser = async (input) => {
  const payload = {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    role: toAdminRole(input.role),
  };

  const created = await axios.post('/admin/admins', payload);
  return normalizeUser(created?.data || created);
};

export const updateUser = async (id, input) => {
  const requests = [];

  if (input.role) {
    requests.push(
      axios.patch(`/admin/admins/${id}/role`, { role: toAdminRole(input.role) })
    );
  }

  if (typeof input.isActive === 'boolean') {
    requests.push(
      input.isActive
        ? axios.patch(`/admin/admins/${id}/activate`)
        : axios.patch(`/admin/admins/${id}/deactivate`)
    );
  }

  if (requests.length === 0) {
    return getUserById(id);
  }

  await Promise.all(requests);
  return getUserById(id);
};

export const updateAdminRole = async (id, role) => {
  await axios.patch(`/admin/admins/${id}/role`, { role: toAdminRole(role) });
  return getUserById(id);
};

export const activateAdmin = async (id) => {
  await axios.patch(`/admin/admins/${id}/activate`);
  return getUserById(id);
};

export const deactivateAdmin = async (id) => {
  await axios.patch(`/admin/admins/${id}/deactivate`);
  return getUserById(id);
};

export const deleteUser = async (id) => {
  await axios.patch(`/admin/admins/${id}/deactivate`);
  return { success: true, id };
};

const BUILTIN_ROLES = [
  { id: 'Admin', name: 'Admin' },
  { id: 'SuperAdmin', name: 'SuperAdmin' },
];

export const getRoles = async () => BUILTIN_ROLES;

export const getRoleById = async (id) => {
  const role = BUILTIN_ROLES.find((item) => item.id === id);
  if (!role) {
    const err = new Error('Role not found');
    err.status = 404;
    throw err;
  }
  return role;
};

export const createRole = async () => {
  const err = new Error('Role CRUD is not exposed by current backend API.');
  err.status = 405;
  throw err;
};

export const updateRole = async () => {
  const err = new Error('Role CRUD is not exposed by current backend API.');
  err.status = 405;
  throw err;
};

export const deleteRole = async () => {
  const err = new Error('Role CRUD is not exposed by current backend API.');
  err.status = 405;
  throw err;
};

const cleanQuery = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

export const getHelpers = async (params = {}) => {
  const payload = await axios.get('/admin/helpers', { params: cleanQuery(params) });
  
  const responseData = payload.data?.data || payload.data;
  
  const items = toArray(responseData?.items || responseData).map((helper) => ({
    ...normalizeHelper(helper),
    status: normalizeHelperStatus(helper),
  }));

  const meta = responseData;

  if (meta && typeof meta === 'object') {
    return {
      data: items,
      pagination: {
        page: meta.page ?? meta.Page ?? meta.currentPage ?? 1,
        pageSize: meta.pageSize ?? meta.PageSize ?? meta.limit ?? 10,
        totalItems: meta.totalCount ?? meta.totalItems ?? meta.total ?? items.length,
        totalPages: meta.totalPages ?? meta.pages ?? 1,
        hasNextPage: meta.hasNextPage,
        hasPreviousPage: meta.hasPreviousPage,
      },
    };
  }

  return { data: items, pagination: { page: 1, totalPages: 1, totalItems: items.length, pageSize: items.length } };
};

export const getPendingHelpers = async () => {
  const payload = await axios.get('/admin/helpers/pending');
  return toArray(payload).map((helper) => ({
    ...normalizeHelper(helper),
    status: normalizeHelperStatus(helper),
  }));
};

export const getHelperById = async (id) => {
  const payload = await axios.get(`/admin/helpers/${id}`);
  const helper = payload?.data?.data || payload?.data || payload;
  return {
    ...normalizeHelper(helper),
    status: normalizeHelperStatus(helper),
  };
};

export const createHelper = async (input = {}) => {
  const payload = {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    district: input.district,
    hasCar: input.hasCar,
    hasDrugTest: input.hasDrugTest,
    skills: input.skills,
  };

  const created = await axios.post('/admin/helpers', payload);
  return normalizeHelper(created?.data || created);
};

export const updateHelper = async (id, input = {}) => {
  const payload = {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    district: input.district,
    hasCar: input.hasCar,
    hasDrugTest: input.hasDrugTest,
    skills: input.skills,
  };

  await axios.patch(`/admin/helpers/${id}`, payload);
  return getHelperById(id);
};

export const deleteHelper = async (id) => {
  await axios.delete(`/admin/helpers/${id}`);
  return { success: true, id };
};

export const approveHelper = async (id) => {
  const actionResult = await runHelperAction(id, 'approve');
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const markHelperUnderReview = async (id) => {
  await runHelperAction(id, 'mark-under-review');
  return getHelperById(id);
};

export const rejectHelper = async (id, reason) => {
  const actionResult = await runHelperAction(id, 'reject', { reason });
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const suspendHelper = async (id, reason) => {
  const actionResult = await runHelperAction(id, 'suspend', { reason });
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const banHelper = async (id, reason) => {
  const actionResult = await runHelperAction(id, 'ban', { reason });
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const unbanHelper = async (id) => {
  const actionResult = await runHelperAction(id, 'unban');
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const activateHelper = async (id) => {
  const actionResult = await runHelperAction(id, 'activate');
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const requestHelperChanges = async (id, reason) => {
  const actionResult = await runHelperAction(id, 'request-changes', { reason });
  const helper = await getHelperById(id);
  return { helper, actionResult };
};

export const getHelperNotes = async (helperId) => {
  const payload = await axios.get(`/admin/helpers/${helperId}/notes`);
  return toArray(payload).map((note, index) => ({
    id: note.id || `${helperId}-note-${index}`,
    note: note.note || note.text || '',
    createdAt: note.createdAt || note.date,
    createdBy: note.createdBy || note.adminName || note.adminId || '',
  }));
};

export const createHelperNote = async (helperId, note) => {
  const payload = await axios.post(`/admin/helpers/${helperId}/notes`, { note });
  const item = payload?.data?.data || payload?.data || payload;

  return {
    id: item?.id || `${helperId}-note-${Date.now()}`,
    note: item?.note || item?.text || note,
    createdAt: item?.createdAt || new Date().toISOString(),
    createdBy: item?.createdBy || item?.adminName || item?.adminId || '',
  };
};
