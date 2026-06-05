import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Clock, User, Mail, Globe, Star, Calendar, AlertCircle, Video, FileText, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import { services } from '../../services';
import toast from 'react-hot-toast';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';

const normalizePairs = (interview = {}, questionLabel = 'Question') => {
  const sources = [
    interview.questions,
    interview.questionAnswers,
    interview.answers,
    interview.items,
    interview.qas,
    interview.qaPairs,
  ];

  const list = sources.find((source) => Array.isArray(source)) || [];

  return list.map((item, index) => ({
    id: item.id || `${index}`,
    questionIndex: item.questionIndex ?? index,
    topicName: item.topicName || '',
    questionText: item.questionText || item.question || item.prompt || item.text || `${questionLabel} ${index + 1}`,
    videoUrl: item.videoUrl || null,
    durationSeconds: item.durationSeconds ?? null,
    transcript: item.transcript || '',
    evaluation: item.evaluation || null,
    answer: item.answer || item.response || item.answerText || item.textAnswer || '',
  }));
};

const getStatus = (interview) =>
  interview.status || interview.reviewStatus || interview.state || interview.interviewStatus || '';

const getStatusColor = (status) => {
  const normalized = String(status || '').toLowerCase();
  switch (normalized) {
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'awaitinghumanreview':
    case 'manualreviewrequired':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed':
    case 'passed':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-surface-inset text-ink-muted border-stroke';
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const formatDate = (dateStr, locale = 'en-US') => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminInterviewDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canReview = can(PERMISSIONS.ADMIN_INTERVIEWS_VIEW);

  const [interview, setInterview] = useState(null);
  const [helperHistory, setHelperHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [cooldownDays, setCooldownDays] = useState('14');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showQuestionNav, setShowQuestionNav] = useState(true);

  const fetchInterview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.interviews.getInterviewById(id);
      setInterview(data);
      if (data?.helperId) {
        const history = await services.interviews.getInterviewsByHelper(data.helperId);
        setHelperHistory(history);
      } else {
        setHelperHistory([]);
      }
    } catch {
      toast.error(t('errors.fetchFailed', 'Failed to fetch data'));
      setInterview(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchInterview();
  }, [id, fetchInterview]);

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const questionLabel = t('interviews.questionLabel', 'Question');
  const pairs = useMemo(() => normalizePairs(interview || {}, questionLabel), [interview, questionLabel]);
  const status = useMemo(() => getStatus(interview || {}), [interview]);
  const normalizedStatus = String(status || '').toLowerCase();
  const canApproveReject = ['awaitinghumanreview', 'manualreviewrequired'].includes(normalizedStatus);
  const canReprocess = ['awaitinghumanreview', 'manualreviewrequired'].includes(normalizedStatus);

  const helperName = interview?.helperName || interview?.helperFullName || interview?.fullName || '';
  const helperEmail = interview?.userEmail || interview?.email || '';
  const language = interview?.languageName || interview?.language || interview?.languageCode || '';

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const result = await services.interviews.approveInterview(id);
      const notice = result?.actionResult;
      if (notice?.message) {
        toast.success(notice.message);
      } else {
        toast.success(t('interviews.approveSuccess', 'Interview approved'));
      }
      await fetchInterview();
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const days = cooldownDays === '' ? undefined : Number(cooldownDays);
      const result = await services.interviews.rejectInterview(id, {
        reason: rejectReason || undefined,
        cooldownDays: Number.isFinite(days) ? days : undefined,
      });
      const notice = result?.actionResult;
      if (notice?.message) {
        toast.success(notice.message);
      } else {
        toast.success(t('interviews.rejectSuccess', 'Interview rejected'));
      }
      setRejectModalOpen(false);
      await fetchInterview();
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprocess = async () => {
    setActionLoading(true);
    try {
      const result = await services.interviews.reprocessInterview(id);
      const notice = result?.actionResult;
      if (notice?.message) {
        toast.success(notice.message);
      } else {
        toast.success(t('interviews.reprocessSuccess', 'Interview queued for reprocess'));
      }
      await fetchInterview();
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setActionLoading(false);
    }
  };

  if (!canReview) {
    return (
      <AdminStateWrapper
        variant="forbidden"
        title={t('states.forbiddenTitle', 'Access Denied')}
        message={t('states.forbiddenView', 'You do not have permission to view this')}
      />
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-ink">{t('common.loading', 'Loading...')}</div>;
  }

  if (!interview) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">{t('interviews.notFound', 'Interview not found')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Improved Header with Status */}
      <div className="bg-surface-muted rounded-xl border border-stroke p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" onClick={() => navigate('/admin/interviews')} className="!p-2 hover:bg-surface-inset rounded-lg">
              <ArrowLeft size={20} className="text-ink-muted" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ink mb-2">{t('interviews.detailTitle', 'Interview Review')}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {interview?.helperPhoto && (
                  <img src={interview.helperPhoto} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-stroke shadow-sm" />
                )}
                <div>
                  <p className="text-sm font-medium text-ink">{helperName || '-'}</p>
                  <p className="text-xs text-ink-muted">{helperEmail || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(status)}`}>
              {status || t('common.na', 'N/A')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-blue-100">
          <Button
            variant="outline"
            onClick={handleApprove}
            disabled={actionLoading || !canApproveReject}
            className="!border-green-400 !text-green-700 hover:!bg-green-50 !font-medium"
          >
            <CheckCircle2 size={18} className="mr-2" />
            {t('interviews.approve', 'Approve')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setRejectModalOpen(true)}
            disabled={actionLoading || !canApproveReject}
            className="!border-red-400 !text-red-700 hover:!bg-red-50 !font-medium"
          >
            <XCircle size={18} className="mr-2" />
            {t('interviews.reject', 'Reject')}
          </Button>
          <Button
            variant="outline"
            onClick={handleReprocess}
            disabled={actionLoading || !canReprocess}
            className="!font-medium"
          >
            <RefreshCw size={18} className="mr-2" />
            {t('interviews.reprocess', 'Reprocess')}
          </Button>
        </div>
      </div>



      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-lg border p-4 hover:shadow-md transition-shadow ${interview?.aiFailureReason || !interview?.aiOverallScore
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-surface border-stroke'
          }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('interviews.aiScore', 'AI Score')}</span>
            <Star size={16} className={interview?.aiOverallScore ? 'text-yellow-500' : 'text-ink-muted'} />
          </div>
          {interview?.aiOverallScore ? (
            <>
              <p className="text-2xl font-bold text-ink">{interview.aiOverallScore}</p>
              <div className="mt-2 w-full bg-surface-inset rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (interview.aiOverallScore / 100) * 100))}%` }}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm font-semibold ${interview?.aiFailureReason ? 'text-red-700' : 'text-ink-muted'}`}>
                {interview?.aiFailureReason
                  ? t('interviews.processingFailed', 'Processing Failed')
                  : t('interviews.pending', 'Pending')}
              </p>
              <p className={`text-xs line-clamp-2 ${interview?.aiFailureReason ? 'text-red-600' : 'text-ink-muted'}`}>
                {interview?.aiFailureReason
                  ? t('interviews.aiUnable', 'AI unable to evaluate')
                  : t('interviews.awaitingAi', 'Awaiting AI evaluation')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('interviews.createdAt', 'Created')}</span>
            <Calendar size={16} className="text-blue-500" />
          </div>
          <p className="text-sm font-medium text-ink">
            {interview && formatDate(interview.createdAt, locale).split(',')[0]}
          </p>
          <p className="text-xs text-ink-muted mt-1">{interview && formatDate(interview.createdAt, locale).split(',')[1]}</p>
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('interviews.aiDecision', 'AI Decision')}</span>
            <Zap size={16} className={interview?.aiDecision ? 'text-purple-500' : 'text-ink-muted'} />
          </div>
          <p className={`text-sm font-medium ${interview?.aiDecision ? 'text-ink' : 'text-ink-muted'}`}>
            {interview?.aiDecision ?? interview?.finalDecision ?? t('interviews.notEvaluated', 'Not evaluated')}
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted uppercase">{t('interviews.questions', 'Questions')}</span>
            <FileText size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-ink">{pairs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Sidebar - Helper Info and History */}
        <div className="xl:col-span-1 space-y-6 order-last xl:order-first">
          {/* Helper Info Card */}
          <Card className="!border-none !shadow-md sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm">{t('interviews.helper', 'Helper')}</h3>
                <p className="text-xs text-ink-muted">{t('interviews.applicant', 'Applicant')}</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-stroke pt-4">
              <div className="flex items-start gap-3">
                <User size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink-muted">{t('interviews.name', 'Name')}</p>
                  <p className="text-sm font-medium text-ink truncate">{helperName || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink-muted">{t('interviews.email', 'Email')}</p>
                  <p className="text-sm font-medium text-ink break-all text-xs">{helperEmail || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={14} className="text-ink-muted flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-ink-muted">{t('interviews.language', 'Language')}</p>
                  <p className="text-sm font-medium text-ink">{language || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Interview History Card */}
          <Card className="!border-none !shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">{t('interviews.helperHistory', 'Interview History')}</h3>
              {helperHistory.length > 0 && (
                <span className="text-xs font-semibold text-ink-muted bg-surface-inset px-2 py-1 rounded">
                  {helperHistory.length}
                </span>
              )}
            </div>
            {helperHistory.length > 0 ? (
              <div className="space-y-2">
                {helperHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-surface-muted rounded-lg hover:bg-surface-inset transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-ink">{item.languageName || '-'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(item.status)}`}>
                        {item.status || '-'}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">{formatDate(item.createdAt, locale)}</p>
                  </div>
                ))}
                {helperHistory.length > 5 && (
                  <p className="text-xs text-ink-muted text-center py-2">
                    +{helperHistory.length - 5} {t('interviews.more', 'more')}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-ink-muted">{t('interviews.noHistory', 'No previous interviews')}</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="!border-none !shadow-md !p-0">
            <div className="p-4 border-b border-stroke">
              <h3 className="font-semibold text-ink text-sm">{t('interviews.details', 'Details')}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-ink-muted font-medium mb-1">{t('interviews.submittedAt', 'Submitted')}</p>
                <p className="text-sm text-ink">{interview && formatDate(interview.submittedAt, locale)}</p>
              </div>
              <div className="border-t border-stroke pt-3">
                <p className="text-xs text-ink-muted font-medium mb-1">{t('interviews.status', 'Status')}</p>
                <p className={`text-sm font-semibold ${['approved', 'passed'].some(s => normalizedStatus.includes(s)) ? 'text-green-600' : 'text-amber-600'}`}>
                  {status || '-'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Q&A Section */}
        <div className="xl:col-span-4 space-y-6">
          {/* Questions Navigator */}
          {pairs.length > 0 && (
            <div className="bg-surface rounded-lg border border-stroke p-4">
              <button
                onClick={() => setShowQuestionNav(!showQuestionNav)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-ink flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  {t('interviews.questions', 'Questions')} ({pairs.length})
                </h3>
                {showQuestionNav ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showQuestionNav && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-stroke">
                  {pairs.map((pair, index) => (
                    <button
                      key={pair.id}
                      onClick={() => {
                        setSelectedQuestionId(pair.id);
                        document.getElementById(`question-${pair.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${selectedQuestionId === pair.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-surface-inset text-ink-muted hover:bg-surface-muted'
                        }`}
                    >
                      {t('interviews.questionShort', 'Q')}{index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Q&A Items */}
          {pairs.length > 0 ? (
            <div className="space-y-5">
              {pairs.map((pair, index) => (
                <Card
                  key={pair.id}
                  className="!border-none !shadow-md !p-0 overflow-hidden hover:shadow-lg transition-shadow"
                  id={`question-${pair.id}`}
                >
                  {/* Question Header */}
                  <div className="bg-surface-muted border-b border-stroke px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-ink leading-relaxed">
                            {pair.questionText || '-'}
                          </h3>
                          {pair.topicName && (
                            <p className="text-xs text-ink-muted mt-2">{t('interviews.topic', 'Topic')}: <span className="font-medium text-ink">{pair.topicName}</span></p>
                          )}
                        </div>
                      </div>
                      {pair.videoUrl && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-surface-inset rounded-full text-xs font-medium text-ink-muted whitespace-nowrap flex-shrink-0">
                          <Video size={14} className="text-red-500 dark:text-red-400" />
                          {formatDuration(pair.durationSeconds) || t('interviews.video', 'Video')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6 space-y-5">
                    {/* Video Section */}
                    {pair.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                        <div className="relative aspect-video bg-black">
                          <video
                            controls
                            className="w-full h-full"
                            src={pair.videoUrl}
                            poster={pair.videoUrl?.replace(/\.(mp4|webm|mov)$/, '_thumb.jpg')}
                          />
                        </div>
                      </div>
                    )}

                    {/* Transcript Section */}
                    {pair.transcript ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-amber-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-amber-900">{t('interviews.transcript', 'Transcript')}</span>
                        </div>
                        <p className="text-sm text-amber-800 leading-relaxed font-light">
                          {pair.transcript}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-surface-muted border border-stroke rounded-lg p-4 flex items-center gap-3">
                        <FileText size={16} className="text-ink-muted flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-ink">{t('interviews.transcript', 'Transcript')}</p>
                          <p className="text-xs text-ink-muted mt-0.5">{t('interviews.notAvailable', 'Not available')}</p>
                        </div>
                      </div>
                    )}

                    {/* Evaluation Section with Visual Score */}
                    {pair.evaluation ? (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-green-900">{t('interviews.evaluation', 'AI Evaluation')}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(pair.evaluation).map(([key, value]) => {
                            const numValue = typeof value === 'number' ? value : parseFloat(value);
                            const isScore = !isNaN(numValue);
                            return (
                              <div key={key} className="bg-surface rounded-lg p-3 shadow-sm border border-green-200">
                                <p className="text-xs text-green-700 font-medium capitalize block mb-2">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <div className="flex items-end gap-2">
                                  <span className="text-xl font-bold text-green-600">
                                    {isScore ? numValue.toFixed(1) : String(value).slice(0, 3)}
                                  </span>
                                  {isScore && (
                                    <div className="flex-1 w-12">
                                      <div className="w-full bg-green-100 rounded-full h-1.5">
                                        <div
                                          className="bg-gradient-to-r from-orange-400 to-green-500 h-1.5 rounded-full"
                                          style={{ width: `${Math.min(100, numValue)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                          <Star size={24} className="text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">{t('interviews.evaluation', 'AI Evaluation')}</p>
                        <p className="text-xs text-blue-600">{t('interviews.awaitingAiResults', 'Awaiting AI evaluation results')}</p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!pair.videoUrl && !pair.evaluation && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-surface-inset flex items-center justify-center mx-auto mb-4">
                          <AlertCircle size={28} className="text-ink-muted" />
                        </div>
                        <p className="text-ink font-medium mb-1">{t('interviews.noData', 'Limited Data Available')}</p>
                        <p className="text-sm text-ink-muted">
                          {!pair.videoUrl
                            ? t('interviews.videoMissing', 'Video answer not found.')
                            : t('interviews.awaitingAi', 'Awaiting AI evaluation.')}{' '}
                          {t('interviews.checkBack', 'Check back later for complete results.')}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="!border-none !shadow-md">
              <div className="text-center py-16">
                <FileText size={40} className="mx-auto mb-3 text-ink-muted" />
                <p className="text-ink-muted text-sm">{t('interviews.noQa', 'No question data available')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal - Enhanced */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setCooldownDays('14');
        }}
        title={t('interviews.rejectInterview', 'Reject Interview')}
      >
        <div className="space-y-5">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-4">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-red-900">{t('interviews.rejectWarning', 'Confirm Rejection')}</p>
              <p className="text-sm text-red-700 mt-2">
                {t('interviews.rejectMessage', 'The helper will be notified and may reapply after the cooldown period.')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              {t('interviews.rejectReason', 'Reason for Rejection')} ({t('common.optional', 'Optional')})
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('interviews.rejectReasonPlaceholder', 'Briefly explain why this interview was rejected...')}
              className="w-full px-4 py-3 rounded-lg border border-stroke bg-surface text-ink placeholder:text-ink-muted focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              {t('interviews.cooldownDays', 'Cooldown Period (days)')}
            </label>
            <Input
              type="number"
              min="0"
              value={cooldownDays}
              onChange={(e) => setCooldownDays(e.target.value)}
              helperText={cooldownDays === '0' ? t('interviews.cooldownZero', '0 = Immediate retake allowed') : t('interviews.cooldownInfo', 'Helper can retake after this period')}
              className="w-full"
            />
          </div>

          {/* Summary */}
          <div className="bg-surface-muted rounded-lg p-4 border border-stroke">
            <p className="text-xs font-semibold text-ink mb-3">{t('interviews.rejectionSummary', 'Rejection Summary')}</p>
            <div className="space-y-2 text-sm text-ink-muted">
              <p>• {t('interviews.helperNotifed', 'Helper will be notified of rejection')}</p>
              <p>• {t('interviews.cooldownApplied', 'Cooldown period: {{days}} days', { days: cooldownDays || 0 })}</p>
              {rejectReason && <p>• {t('interviews.reasonProvided', 'Reason will be provided to helper')}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-stroke pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectReason('');
                setCooldownDays('14');
              }}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleReject}
              isLoading={actionLoading}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              <XCircle size={16} className="mr-2" />
              {t('interviews.confirmReject', 'Confirm Rejection')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInterviewDetailPage;
