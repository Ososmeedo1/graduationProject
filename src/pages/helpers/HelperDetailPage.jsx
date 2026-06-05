import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, Phone, MapPin, ClipboardList, Cake, User, Image as ImageIcon, Shield, Car as CarIcon, Award, AlertCircle, CheckCircle2, Clock, Globe, FileText, Download, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FileViewerModal from '../../components/ui/FileViewerModal';
import HelperStatusBadge from '../../components/admin/management/HelperStatusBadge';
import HelperNotesTimeline from '../../components/admin/management/HelperNotesTimeline';
import ReviewActionDialog from '../../components/admin/management/ReviewActionDialog';
import { services } from '../../services';
import toast from 'react-hot-toast';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';
import { deriveHelperState, getAllowedActions } from './helperState';

const HelperDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAny } = usePermissions();
  const canReview = canAny([PERMISSIONS.ADMIN_MANAGE, PERMISSIONS.OPERATIONS_REVIEW]);

  const [helper, setHelper] = useState(null);
  const [notes, setNotes] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState({ isOpen: false, action: null });
  const [approvalNotice, setApprovalNotice] = useState(null);
  const [fileViewer, setFileViewer] = useState({ isOpen: false, url: null, title: null });

  const openFileViewer = (url, title) => setFileViewer({ isOpen: true, url, title });
  const closeFileViewer = () => setFileViewer({ isOpen: false, url: null, title: null });

  const loadHelper = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.helpers.getHelperById(id);
      setHelper(data);
    } catch {
      toast.error(t('errors.fetchFailed', 'Failed to load helper'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    try {
      const data = await services.notes.getHelperNotes(id);
      setNotes(data);
    } catch {
      setNotes([]);
    }
  }, [id]);

  const loadAuditHistory = useCallback(async () => {
    if (!id) return;
    try {
      const logs = await services.audit.getHelperAuditLogs(id);
      const mapped = (Array.isArray(logs) ? logs : []).map((log, index) => ({
        id: log.id || `${log.createdAt || 'audit'}-${index}`,
        createdBy: log.adminName || log.adminFullName || log.performedByName || log.actorName || log.userName || '',
        createdAt: log.createdAt || log.createdOn || log.timestamp || log.eventTime || '',
        note: [log.action, log.targetType].filter(Boolean).join(' - ') || t('adminDashboard.actionLabel', 'Action'),
      }));
      setAuditHistory(mapped);
    } catch {
      setAuditHistory([]);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) {
      loadHelper();
      loadNotes();
      loadAuditHistory();
    }
  }, [id, loadHelper, loadNotes, loadAuditHistory]);

  const openReviewDialog = (action) => {
    if (!helper) return;
    setReviewDialog({ isOpen: true, action });
  };

  const closeReviewDialog = () => setReviewDialog({ isOpen: false, action: null });

  const handleReviewAction = async ({ reason, suspensionPeriod }) => {
    if (!helper || !canReview) {
      toast.error(t('errors.forbidden', 'Access denied'));
      return;
    }

    const action = reviewDialog.action;

    try {
      if (action === 'markUnderReview') {
        await services.helpers.markHelperUnderReview(helper.id);
      } else if (action === 'unban') {
        const result = await services.helpers.unbanHelper(helper.id);
        const notice = result?.actionResult;
        if (notice?.message) {
          toast.success(notice.message);
        }
      } else if (action === 'approve') {
        const result = await services.helpers.approveHelper(helper.id);
        const notice = result?.actionResult;
        if (notice?.message) {
          setApprovalNotice({
            message: notice.message,
            blockingReasons: Array.isArray(notice.blockingReasons) ? notice.blockingReasons : [],
          });
          toast.success(notice.message);
        }
      } else if (action === 'reject') {
        const result = await services.helpers.rejectHelper(helper.id, reason);
        const notice = result?.actionResult;
        if (notice?.message) {
          toast.success(notice.message);
        }
      } else if (action === 'suspend') {
        const composedReason = suspensionPeriod ? `${reason} (${suspensionPeriod})` : reason;
        const result = await services.helpers.suspendHelper(helper.id, composedReason);
        const notice = result?.actionResult;
        if (notice?.message) {
          toast.success(notice.message);
        }
      } else if (action === 'ban') {
        const result = await services.helpers.banHelper(helper.id, reason);
        const notice = result?.actionResult;
        if (notice?.message) {
          toast.success(notice.message);
        }
      } else if (action === 'activate') {
        const result = await services.helpers.activateHelper(helper.id);
        const notice = result?.actionResult;
        if (notice?.message) {
          setApprovalNotice({
            message: notice.message,
            blockingReasons: Array.isArray(notice.blockingReasons) ? notice.blockingReasons : [],
          });
          toast.success(notice.message);
        }
      } else if (action === 'requestChanges') {
        const result = await services.helpers.requestHelperChanges(helper.id, reason);
        const notice = result?.actionResult;
        if (notice?.message) {
          toast.success(notice.message);
        }
      } else if (action === 'note') {
        await services.notes.createHelperNote(helper.id, reason);
      }

      toast.success(t('helpers.actionSuccess', 'Helper updated successfully'));
      closeReviewDialog();
      await loadHelper();
      await loadNotes();
      await loadAuditHistory();
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
      if (Array.isArray(error?.blockingReasons) && error.blockingReasons.length > 0) {
        setApprovalNotice({
          message: error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'),
          blockingReasons: error.blockingReasons,
        });
      }
    }
  };

  const languages = useMemo(() => {
    if (!helper?.languages) return [];
    if (Array.isArray(helper.languages)) {
      return helper.languages.map((lang) => lang.languageName || lang.name || lang.languageCode || lang);
    }
    return [];
  }, [helper?.languages]);


  const state = useMemo(() => deriveHelperState(helper), [helper]);
  const actions = useMemo(() => getAllowedActions(state), [state]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const renderBool = (value) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-surface-inset text-ink-muted'}`}>
      {value ? t('common.yes', 'Yes') : t('common.no', 'No')}
    </span>
  );

  if (loading) return <div className="p-8 text-center text-ink">{t('common.loading', 'Loading...')}</div>;
  if (!helper) return <div className="p-8 text-center text-red-500">{t('helpers.notFound', 'Helper not found')}</div>;

  return (
    <div className="space-y-6">
      {/* Back Button Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-stroke">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
          title={t('common.back', 'Back')}
        >
          <ArrowLeft size={20} className="text-ink-muted" />
        </button>
        {helper.profileImageUrl && (
          <img src={helper.profileImageUrl} alt={helper.fullName} className="w-10 h-10 rounded-full object-cover border border-stroke" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink">{helper.fullName || t('helpers.unknown', 'Unknown')}</h1>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('helpers.summary.approval', 'Approval')}</span>
            <CheckCircle2 size={16} className={helper.isApproved ? 'text-green-500' : 'text-ink-muted'} />
          </div>
          <p className={`text-sm font-semibold ${helper.isApproved ? 'text-green-600' : 'text-ink-muted'}`}>
            {helper.approvalStatus || t('helpers.summary.pending', 'Pending')}
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('helpers.summary.status', 'Status')}</span>
            <User size={16} className={helper.isActive ? 'text-blue-500' : 'text-ink-muted'} />
          </div>
          <p className={`text-sm font-semibold ${helper.isActive ? 'text-blue-600' : helper.isSuspended ? 'text-amber-600' : 'text-ink-muted'}`}>
            {helper.isActive
              ? t('helpers.summary.active', 'Active')
              : helper.isSuspended
                ? t('helpers.summary.suspended', 'Suspended')
                : t('helpers.summary.inactive', 'Inactive')}
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('helpers.summary.onboarding', 'Onboarding')}</span>
            <ClipboardList size={16} className="text-purple-500" />
          </div>
          <p className={`text-sm font-semibold ${helper.completedSteps?.length === (helper.completedSteps?.length + helper.missingSteps?.length) ? 'text-green-600' : 'text-amber-600'}`}>
            {helper.completedSteps?.length || 0}/{(helper.completedSteps?.length || 0) + (helper.missingSteps?.length || 0)}
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('helpers.summary.languages', 'Languages')}</span>
            <Globe size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-ink">{languages.length}</p>
          {languages.length > 0 && (
            <p className="text-xs text-ink-muted mt-2">
              {languages.slice(0, 2).join(', ')}{languages.length > 2 ? '...' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-1 space-y-6 order-last xl:order-first">
          <Card className="!border-none !shadow-md sticky top-6">
            <div className="flex flex-col items-center text-center pb-4 border-b border-stroke mb-4">
              <div className="flex gap-2 mb-3">
                {helper.profileImageUrl && (
                  <img
                    src={helper.profileImageUrl}
                    alt={helper.fullName || 'Helper'}
                    onClick={() => openFileViewer(helper.profileImageUrl, t('helpers.profileImage', 'Profile Image'))}
                    className="w-20 h-20 rounded-full object-cover border-4 border-stroke shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                  />
                )}
              </div>
              <h2 className="text-lg font-bold text-ink">{helper.fullName || t('helpers.unknown', 'Unknown')}</h2>
            </div>

            <div className="space-y-3 border-t border-stroke pt-4">
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink-muted">{t('common.email', 'Email')}</p>
                  <p className="text-sm font-medium text-ink break-all text-xs">{helper.userEmail || helper.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-ink-muted">{t('common.phone', 'Phone')}</p>
                  <p className="text-sm font-medium text-ink">{helper.userPhone || helper.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-ink-muted">{t('common.gender', 'Gender')}</p>
                  <p className="text-sm font-medium text-ink">{helper.gender || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cake size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-ink-muted">{t('common.dateOfBirth', 'Birth Date')}</p>
                  <p className="text-sm font-medium text-ink">{formatDate(helper.birthDate)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!border-none !shadow-md mt-6">
            <div className="p-4 border-b border-stroke mb-0">
              <h3 className="font-semibold text-ink text-sm">{t('helpers.account.title', 'Account Status')}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">{t('helpers.account.isApproved', 'Approved')}</span>
                {renderBool(helper.isApproved)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">{t('helpers.account.isActive', 'Active')}</span>
                {renderBool(helper.isActive)}
              </div>
              <div className="flex items-center justify-between border-t border-stroke pt-3">
                <span className="text-sm text-ink-muted">{t('helpers.account.isSuspended', 'Suspended')}</span>
                {renderBool(helper.isSuspended)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">{t('helpers.account.isBanned', 'Banned')}</span>
                {renderBool(helper.isBanned)}
              </div>
            </div>
            {(helper.banReason || helper.suspensionReason || helper.rejectionReason) && (
              <>
                <div className="border-t border-stroke p-4 space-y-2">
                  {helper.rejectionReason && (
                    <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                      <p className="text-xs font-medium text-red-700 mb-1">{t('helpers.account.rejectionReason', 'Rejection Reason')}</p>
                      <p className="text-xs text-red-600">{helper.rejectionReason}</p>
                    </div>
                  )}
                  {helper.banReason && (
                    <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                      <p className="text-xs font-medium text-red-700 mb-1">{t('helpers.account.banReason', 'Ban Reason')}</p>
                      <p className="text-xs text-red-600">{helper.banReason}</p>
                      {helper.bannedAt && (
                        <p className="text-xs text-red-600 mt-2">{t('helpers.account.bannedAt', 'Banned at')}: {formatDateTime(helper.bannedAt)}</p>
                      )}
                    </div>
                  )}
                  {helper.suspensionReason && (
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                      <p className="text-xs font-medium text-amber-700 mb-1">{t('helpers.account.suspensionReason', 'Suspension Reason')}</p>
                      <p className="text-xs text-amber-600">{helper.suspensionReason}</p>
                      {helper.suspendedAt && (
                        <p className="text-xs text-amber-600 mt-2">{t('helpers.account.suspendedAt', 'Suspended at')}: {formatDateTime(helper.suspendedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          <Card className="!border-none !shadow-md">
            <div className="p-4 border-b border-stroke mb-0">
              <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" />
                {t('helpers.fields.languages', 'Languages')}
              </h3>
            </div>
            <div className="p-4">
              {languages.length > 0 ? (
                <div className="space-y-2">
                  {helper.languages?.map((lang) => (
                    <div key={lang.id} className="p-3 bg-surface-muted rounded-lg hover:bg-surface-inset transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-ink">{lang.languageName || lang.languageCode}</span>
                        {lang.isVerified ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {t('helpers.languages.verified', 'Verified')}
                          </span>
                        ) : (
                          <span className="text-xs bg-surface-inset text-ink-muted px-2 py-1 rounded-full">
                            {t('helpers.languages.pending', 'Pending')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>{lang.level || t('helpers.languages.noLevel', 'No level')}</span>
                        <span>
                          {t('helpers.languages.testAttempts', '{{count}} test', {
                            count: lang.testAttempts ?? 0,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-ink-muted">{t('helpers.noLanguages', 'No languages added')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="!border-none !shadow-md">
            <div className="p-4 border-b border-stroke mb-0">
              <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                {t('helpers.documentsTitle', 'Documents')}
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: t('helpers.documents.idFront', 'ID Front'), url: helper.nationalIdFront },
                { label: t('helpers.documents.idBack', 'ID Back'), url: helper.nationalIdBack },
                { label: t('helpers.documents.criminalRecord', 'Criminal Record'), url: helper.criminalRecordFile },
              ].map((doc, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => openFileViewer(doc.url, doc.label)}
                  disabled={!doc.url}
                  className="w-full !justify-start !text-sm !py-2"
                >
                  <Eye size={14} className="mr-2" />
                  {doc.label}
                </Button>
              ))}
            </div>
          </Card>

          {canReview && (
            <Card className="!border-none !shadow-md">
              <div className="p-4 border-b border-stroke mb-0">
                <h3 className="font-semibold text-ink text-sm">{t('helpers.actions', 'Actions')}</h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {[
                  { key: 'markUnderReview', color: 'blue', visible: actions.canMarkUnderReview },
                  { key: 'approve', color: 'green', visible: actions.canApprove },
                  { key: 'reject', color: 'red', visible: actions.canReject },
                  { key: 'requestChanges', color: 'amber', visible: actions.canRequestChanges },
                  { key: 'suspend', color: 'amber', visible: actions.canSuspend },
                  { key: 'activate', color: 'blue', visible: actions.canActivate },
                  { key: 'ban', color: 'red', visible: actions.canBan },
                  { key: 'unban', color: 'green', visible: actions.canUnban },
                ]
                  .filter(action => action.visible)
                  .map(action => {
                    const colorClasses = {
                      green: '!border-green-300 !text-green-700 hover:!bg-green-50',
                      red: '!border-red-300 !text-red-700 hover:!bg-red-50',
                      amber: '!border-amber-300 !text-amber-700 hover:!bg-amber-50',
                      blue: '!border-blue-300 !text-blue-700 hover:!bg-blue-50',
                    };
                    return (
                      <Button
                        key={action.key}
                        variant="outline"
                        onClick={() => openReviewDialog(action.key)}
                        className={`!text-sm !py-2 ${colorClasses[action.color] || colorClasses.blue}`}
                      >
                        {t(`helperReview.${action.key}`, action.key.charAt(0).toUpperCase() + action.key.slice(1))}
                      </Button>
                    );
                  })}
                <Button
                  variant="outline"
                  onClick={() => openReviewDialog('note')}
                  className="!text-sm !py-2 !font-medium"
                >
                  {t('helperReview.addNote', 'Add Note')}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          <FileViewerModal 
            isOpen={fileViewer.isOpen} 
            onClose={closeFileViewer} 
            url={fileViewer.url} 
            title={fileViewer.title} 
          />
          {approvalNotice && (
            <Card className="!border-none !shadow-md !border-l-4 !border-l-blue-500 bg-blue-500/10">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">{t('helpers.approvalNotice', 'Approval Notice')}</h3>
                    <p className="text-sm text-blue-800">{approvalNotice.message}</p>
                  </div>
                </div>
                {approvalNotice.blockingReasons.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-blue-700 uppercase">
                      {t('helpers.blockingReasons', 'Blocking Reasons')}
                    </p>
                    <ul className="list-disc ps-5 text-sm text-blue-700 space-y-1">
                      {approvalNotice.blockingReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="!border-none !shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-ink flex items-center gap-2 uppercase tracking-wide">
                    <ClipboardList size={16} className="text-purple-600" />
                    {t('helpers.onboarding.title', 'Onboarding Progress')}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${helper.onboardingStatus === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {helper.onboardingStatus || t('helpers.onboarding.incomplete', 'Incomplete')}
                    </span>
                    {helper.createdAt && (
                      <span className="text-xs text-ink-muted">{t('helpers.registered', 'Registered')}: {formatDate(helper.createdAt)}</span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-ink">
                  {helper.completedSteps?.length || 0}/{(helper.completedSteps?.length || 0) + (helper.missingSteps?.length || 0)}
                </span>
              </div>
              {(helper.completedSteps?.length || 0) + (helper.missingSteps?.length || 0) > 0 && (
                <div className="w-full bg-surface-inset rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full"
                    style={{ width: `${Math.round(((helper.completedSteps?.length || 0) / ((helper.completedSteps?.length || 0) + (helper.missingSteps?.length || 0))) * 100)}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-700 mb-3 uppercase tracking-wide">{t('helpers.onboarding.completed', 'Completed')}</p>
                  <div className="flex flex-wrap gap-2">
                    {(helper.completedSteps || []).length > 0 ? (
                      helper.completedSteps.map((step) => (
                        <span key={step} className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 font-medium">
                          ✓ {step}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-muted">{t('helpers.onboarding.none', 'None')}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-3 uppercase tracking-wide">{t('helpers.onboarding.missing', 'Missing')}</p>
                  <div className="flex flex-wrap gap-2">
                    {(helper.missingSteps || []).length > 0 ? (
                      helper.missingSteps.map((step) => (
                        <span key={step} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium">
                          ◆ {step}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-muted">{t('helpers.onboarding.none', 'None')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!border-none !shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CarIcon size={18} className="text-orange-600" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide">{t('helpers.car.title', 'Vehicle Information')}</h3>
              </div>
              {helper.car ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(helper.car).map(([key, value]) => {
                      if (key.toLowerCase().includes('id') || key.toLowerCase().includes('license') || key.toLowerCase().includes('file')) return null;
                      return (
                        <div key={key} className="p-3 bg-surface-muted rounded-lg border border-stroke">
                          <p className="text-xs font-semibold text-ink-muted mb-1 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm font-medium text-ink">{String(value) || '-'}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-4 border-t border-stroke grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { label: t('helpers.car.licenseFront', 'View Car License (Front)'), url: helper.car.carLicenseFront },
                      { label: t('helpers.car.licenseBack', 'View Car License (Back)'), url: helper.car.carLicenseBack },
                      { label: t('helpers.car.personalLicense', 'View Personal License'), url: helper.car.personalLicense },
                    ].map((doc, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => openFileViewer(doc.url, doc.label)}
                        disabled={!doc.url}
                        className="!text-xs !py-2 !justify-center"
                      >
                        {doc.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-surface-muted rounded-lg border border-dashed border-stroke">
                  <CarIcon size={28} className="mx-auto mb-2 text-ink-muted" />
                  <p className="text-sm text-ink-muted">{t('helpers.car.none', 'No vehicle information added')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="!border-none !shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide">{t('helpers.certificates', 'Certificates')}</h3>
              </div>
              {(helper.certificates || []).length > 0 ? (
                <div className="space-y-2">
                  {helper.certificates.map((item, index) => (
                    <div key={`${item?.id || index}`} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg border border-stroke">
                        <div>
                            <p className="text-sm font-medium text-ink">{item?.name || item?.title || item?.certificateName || t('helpers.certificateItem', 'Certificate {{index}}', { index: index + 1 })}</p>
                            <p className="text-xs text-ink-muted">{item?.type} • {item?.isVerified ? t('common.verified', 'Verified') : t('common.pending', 'Pending')}</p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => openFileViewer(item.filePath, item.name)}
                            className="!py-1 !px-3 !text-xs"
                        >
                            {t('common.view', 'View')}
                        </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-surface-muted rounded-lg border border-dashed border-stroke">
                  <Award size={28} className="mx-auto mb-2 text-ink-muted" />
                  <p className="text-sm text-ink-muted">{t('helpers.certificatesEmpty', 'No certificates added')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="!border-none !shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={18} className="text-red-600" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide">{t('helpers.drugTest.title', 'Drug Test')}</h3>
              </div>
              {helper.currentDrugTest ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface-muted rounded-lg border border-stroke">
                      <p className="text-xs font-bold text-ink-muted mb-1 uppercase tracking-wide">{t('common.status', 'Status')}</p>
                      <p className="text-sm font-semibold text-green-700">{t('helpers.drugTest.currentActive', 'Current & Active')}</p>
                    </div>
                    <div className="p-4 bg-surface-muted rounded-lg border border-stroke">
                      <p className="text-xs font-bold text-ink-muted mb-1 uppercase tracking-wide">{t('helpers.drugTest.uploaded', 'Uploaded')}</p>
                      <p className="text-sm font-medium text-ink">{formatDate(helper.currentDrugTest.uploadedAt)}</p>
                    </div>
                    <div className="p-4 bg-surface-muted rounded-lg border border-stroke">
                      <p className="text-xs font-bold text-ink-muted mb-1 uppercase tracking-wide">{t('helpers.drugTest.expiryDate', 'Expiry Date')}</p>
                      <p className={`text-sm font-semibold ${new Date(helper.currentDrugTest.expiryDate) > new Date() ? 'text-green-700' : 'text-red-700'}`}>
                        {formatDate(helper.currentDrugTest.expiryDate)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => openFileViewer(helper.currentDrugTest.filePath, t('helpers.drugTest.title', 'Drug Test'))}
                    className="w-full !justify-center"
                  >
                    {t('helpers.drugTest.viewButton', 'View Drug Test')}
                  </Button>
                </div>
              ) : (
                <div className="p-6 text-center bg-amber-500/10 rounded-lg border border-dashed border-amber-500/30">
                  <Shield size={28} className="mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">{t('helpers.drugTest.none', 'No drug test uploaded')}</p>
                  <p className="text-xs text-amber-700 mt-1">{t('helpers.drugTest.required', 'Required for approval')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink mb-3">{t('helperReview.notesHistory', 'Notes history')}</h3>
            <HelperNotesTimeline notes={notes} canAddNote={canReview} onAddNote={() => openReviewDialog('note')} />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink mb-3">{t('audit.title', 'Audit history')}</h3>
            <HelperNotesTimeline notes={auditHistory} canAddNote={false} />
          </Card>
        </div>
      </div>

      <ReviewActionDialog
        isOpen={reviewDialog.isOpen}
        actionType={reviewDialog.action}
        helperName={helper?.fullName}
        onClose={closeReviewDialog}
        onConfirm={handleReviewAction}
      />
    </div>
  );
};

export default HelperDetailPage;
