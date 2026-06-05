import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import Card from '../../components/ui/Card';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import { services } from '../../services';

const normalizeText = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  if (!text) return '';

  const lowered = text.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null') return '';

  return text;
};

const resolveBookingId = (item) => normalizeText(item?.bookingId ?? item?.booking?.id ?? item?.id);
const resolveChatId = (item) => normalizeText(item?.chatId ?? item?.conversationId ?? item?.id ?? item?.bookingId ?? item?.booking?.id);

const resolveName = (...values) => {
  for (const value of values) {
    const text = normalizeText(value);
    if (text) return text;
  }
  return '';
};

const parseMessageTime = (message) => {
  const raw = message?.createdAt ?? message?.timestamp ?? message?.sentAt ?? message?.date;
  if (!raw) return null;
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

const resolveRoleType = (role) => {
  const normalizedRole = normalizeText(role).toLowerCase();
  if (!normalizedRole) return '';
  if (normalizedRole.includes('helper') || normalizedRole.includes('guide')) return 'helper';
  if (normalizedRole.includes('tourist') || normalizedRole.includes('customer') || normalizedRole.includes('client') || normalizedRole.includes('user')) return 'user';
  if (normalizedRole.includes('admin')) return 'admin';
  return 'participant';
};

const resolveRoleTypeLabel = (roleType, t) => {
  if (!roleType) return '';
  if (roleType === 'admin') return t('adminChat.senderAdmin', 'Admin');
  if (roleType === 'helper') return t('adminChat.helper', 'Helper');
  if (roleType === 'user') return t('adminChat.user', 'User');
  return t('adminChat.participant', 'Participant');
};

const resolveRoleLabel = (role, t) => resolveRoleTypeLabel(resolveRoleType(role), t);

const resolveHintIds = (item, keys) => {
  const ids = new Set();
  keys.forEach((key) => {
    const value = normalizeText(item?.[key]);
    if (value) ids.add(value.toLowerCase());
  });
  return ids;
};

const resolveHintNames = (item, keys) => {
  const names = new Set();
  keys.forEach((key) => {
    const value = normalizeText(item?.[key]);
    if (value) names.add(value.toLowerCase());
  });
  return names;
};

const resolveParty = (message, side, t) => {
  const isSender = side === 'sender';
  const role = normalizeText(
    isSender
      ? (message?.senderRole ?? message?.fromRole ?? message?.sender?.role ?? message?.role)
      : (message?.receiverRole ?? message?.toRole ?? message?.receiver?.role),
  );

  const name = isSender
    ? resolveName(
      message?.senderName,
      message?.fromName,
      message?.sender?.name,
      message?.sender?.fullName,
      message?.sender?.username,
    )
    : resolveName(
      message?.receiverName,
      message?.toName,
      message?.recipientName,
      message?.receiver?.name,
      message?.receiver?.fullName,
      message?.receiver?.username,
    );

  const id = normalizeText(
    isSender
      ? (message?.senderId ?? message?.fromId ?? message?.sender?.id ?? message?.sender?.userId)
      : (message?.receiverId ?? message?.toId ?? message?.receiver?.id ?? message?.receiver?.userId),
  );

  const roleType = resolveRoleType(role);
  const label = name || resolveRoleTypeLabel(roleType, t) || t('adminChat.participant', 'Participant');

  let signature = '';
  if (id) signature = `${roleType || 'id'}:id:${id}`;
  else if (name) signature = `${roleType || 'name'}:name:${name.toLowerCase()}`;
  else if (roleType) signature = `role:${roleType}`;

  return {
    id,
    name,
    role,
    roleType,
    label,
    signature,
  };
};

const AdminChatManagementPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [chatItems, setChatItems] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [thread, setThread] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await services.chats.getChats({ page: 1, pageSize: 50 });
        if (cancelled) return;

        const items = Array.isArray(result?.data) ? result.data : [];
        setChatItems(items);

        if (items.length > 0) {
          const defaultBookingId = resolveBookingId(items[0]);
          setActiveBookingId(defaultBookingId || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.detail || err?.message || t('errors.fetchFailed', 'Failed to fetch data'));
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

  useEffect(() => {
    if (!activeBookingId) {
      setThread([]);
      return;
    }

    let cancelled = false;

    const loadThread = async () => {
      try {
        const result = await services.chats.getChatMessages(activeBookingId, { page: 1, pageSize: 100 });
        if (!cancelled) {
          setThread(Array.isArray(result?.messages) ? result.messages : []);
        }
      } catch {
        if (!cancelled) {
          setThread([]);
        }
      }
    };

    loadThread();

    return () => {
      cancelled = true;
    };
  }, [activeBookingId]);

  const activeChatItem = useMemo(
    () => chatItems.find((item) => resolveBookingId(item) === String(activeBookingId)),
    [chatItems, activeBookingId],
  );

  const filteredItems = chatItems;

  const sortedThread = useMemo(() => {
    return thread
      .map((message, index) => ({
        message,
        index,
        time: parseMessageTime(message),
      }))
      .sort((a, b) => {
        if (a.time === null && b.time === null) return a.index - b.index;
        if (a.time === null) return 1;
        if (b.time === null) return -1;
        if (a.time === b.time) return a.index - b.index;
        return a.time - b.time;
      })
      .map((item) => item.message);
  }, [thread]);

  const helperHintIds = useMemo(() => {
    const fromItem = resolveHintIds(activeChatItem, ['helperId', 'guideId']);
    sortedThread.forEach((message) => {
      const value = normalizeText(message?.helperId ?? message?.guideId);
      if (value) fromItem.add(value.toLowerCase());
    });
    return fromItem;
  }, [activeChatItem, sortedThread]);

  const userHintIds = useMemo(() => {
    const fromItem = resolveHintIds(activeChatItem, ['userId', 'touristId', 'customerId', 'clientId']);
    sortedThread.forEach((message) => {
      const value = normalizeText(message?.userId ?? message?.touristId ?? message?.customerId ?? message?.clientId);
      if (value) fromItem.add(value.toLowerCase());
    });
    return fromItem;
  }, [activeChatItem, sortedThread]);

  const helperHintNames = useMemo(
    () => resolveHintNames(activeChatItem, ['helperName', 'guideName']),
    [activeChatItem],
  );

  const userHintNames = useMemo(
    () => resolveHintNames(activeChatItem, ['userName', 'touristName', 'customerName', 'clientName']),
    [activeChatItem],
  );

  const conversationParticipants = useMemo(() => {
    const bucket = new Map();

    sortedThread.forEach((message, index) => {
      [resolveParty(message, 'sender', t), resolveParty(message, 'receiver', t)].forEach((party) => {
        if (!party.signature) return;
        const normalizedId = party.id ? party.id.toLowerCase() : '';
        const normalizedName = party.name ? party.name.toLowerCase() : '';

        let inferredRoleType = party.roleType;
        if (inferredRoleType !== 'helper' && inferredRoleType !== 'user' && inferredRoleType !== 'admin') {
          if (normalizedId && helperHintIds.has(normalizedId)) inferredRoleType = 'helper';
          else if (normalizedId && userHintIds.has(normalizedId)) inferredRoleType = 'user';
          else if (normalizedName && helperHintNames.has(normalizedName)) inferredRoleType = 'helper';
          else if (normalizedName && userHintNames.has(normalizedName)) inferredRoleType = 'user';
        }

        if (!bucket.has(party.signature)) {
          bucket.set(party.signature, {
            ...party,
            inferredRoleType,
            firstSeen: index,
            count: 0,
          });
        }
        const current = bucket.get(party.signature);
        if (!current.inferredRoleType && inferredRoleType) {
          current.inferredRoleType = inferredRoleType;
        }
        current.count += 1;
      });
    });

    const all = Array.from(bucket.values()).sort((a, b) => {
      if (a.firstSeen === b.firstSeen) return b.count - a.count;
      return a.firstSeen - b.firstSeen;
    });

    const helper = all.find((participant) => participant.inferredRoleType === 'helper' || participant.roleType === 'helper');
    const user = all.find((participant) => participant.inferredRoleType === 'user' || participant.roleType === 'user');

    if (helper && user) {
      return {
        leftSignature: user.signature,
        rightSignature: helper.signature,
        leftRoleType: 'user',
        rightRoleType: 'helper',
      };
    }

    return {
      leftSignature: all[0]?.signature || '',
      rightSignature: all[1]?.signature || '',
      leftRoleType: 'user',
      rightRoleType: 'helper',
    };
  }, [sortedThread, t, helperHintIds, userHintIds, helperHintNames, userHintNames]);

  return (
    <DirectionalWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('nav.chat_hub', 'Chat Hub')}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t('adminChat.subtitle', 'Monitor conversations and inspect message history.')}
        </p>
      </div>

      {error ? (
        <AdminStateWrapper
          variant="error"
          title={t('errors.fetchFailed', 'Failed to fetch data')}
          message={error}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 min-h-[65vh]">
          <Card className="lg:col-span-1 h-[65vh] min-h-0 overflow-hidden">
            <div className="mt-4 h-full min-h-0 overflow-y-auto pr-1 space-y-2">
              {loading ? (
                <p className="text-sm text-ink-muted">{t('common.loading', 'Loading...')}</p>
              ) : filteredItems.length === 0 ? (
                <p className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</p>
              ) : (
                filteredItems.map((item, idx) => {
                  const bookingId = resolveBookingId(item);
                  const chatId = resolveChatId(item);
                  const isActive = bookingId && String(bookingId) === String(activeBookingId);
                  const canSelect = Boolean(bookingId);
                  const threadTitle = item?.title || item?.subject || t('adminChat.thread', 'Thread');

                  return (
                    <button
                      key={bookingId || item?.id || `${item?.title || item?.subject || 'chat'}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (canSelect) setActiveBookingId(bookingId);
                      }}
                      disabled={!canSelect}
                      className={`w-full rounded-lg border px-3 py-2 text-start transition-colors ${isActive
                        ? 'border-primary-300 bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'border-stroke bg-surface text-ink hover:bg-surface-muted'
                        } ${!canSelect ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <p className="text-sm font-semibold">{threadTitle}</p>
                      {chatId ? (
                        <p className="text-xs text-ink-muted">
                          {t('adminChat.chatId', 'Chat ID')}: {chatId}
                        </p>
                      ) : null}
                      <p className="text-xs text-ink-muted">
                        {canSelect ? t('adminChat.openConversation', 'Open conversation') : t('adminChat.unavailableConversation', 'Conversation unavailable')}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 h-[65vh] min-h-0 overflow-hidden">
            {!activeBookingId ? (
              <AdminStateWrapper
                variant="empty"
                compact
                title={t('adminChat.selectThread', 'Select a thread')}
                message={t('adminChat.selectThreadHint', 'Choose a booking from the left panel to view messages.')}
              />
            ) : (
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center gap-2 border-b border-stroke pb-3">
                  <MessageSquare size={18} className="text-primary-600 dark:text-primary-400" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {t('adminChat.conversation', 'Conversation')}
                    </h2>
                    {resolveChatId(activeChatItem) ? (
                      <p className="text-xs text-ink-muted">
                        {t('adminChat.chatId', 'Chat ID')}: {resolveChatId(activeChatItem)}
                      </p>
                    ) : null}
                    {activeChatItem?.title || activeChatItem?.subject ? (
                      <p className="text-xs text-ink-muted">{activeChatItem?.title || activeChatItem?.subject}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pe-1 space-y-3">
                  {sortedThread.length === 0 ? (
                    <p className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</p>
                  ) : (
                    sortedThread.map((message, idx) => {
                      const senderParty = resolveParty(message, 'sender', t);
                      const receiverParty = resolveParty(message, 'receiver', t);

                      const rightSignature = conversationParticipants.rightSignature;
                      const leftSignature = conversationParticipants.leftSignature;

                      const isRight = Boolean(
                        (rightSignature && senderParty.signature === rightSignature)
                        || (!senderParty.signature && leftSignature && receiverParty.signature === leftSignature),
                      );

                      const senderLabel = senderParty.name
                        || resolveRoleTypeLabel(senderParty.roleType, t)
                        || resolveRoleTypeLabel(isRight ? conversationParticipants.rightRoleType : conversationParticipants.leftRoleType, t)
                        || t('adminChat.participant', 'Participant');

                      const receiverLabel = receiverParty.name
                        || resolveRoleTypeLabel(receiverParty.roleType, t)
                        || resolveRoleTypeLabel(isRight ? conversationParticipants.leftRoleType : conversationParticipants.rightRoleType, t)
                        || t('adminChat.participant', 'Participant');

                      return (
                        <div
                          key={message?.id || `${activeBookingId}-${idx}`}
                          className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isRight
                              ? 'rounded-br-md bg-primary-600 text-white'
                              : 'rounded-bl-md border border-stroke bg-surface-inset text-ink'
                              }`}
                          >
                            <p className={`mb-1 text-[11px] font-semibold ${isRight ? 'text-primary-100' : 'text-ink-muted'}`}>
                              {senderLabel}
                            </p>
                            <p className="whitespace-pre-wrap">{message?.content || message?.text || ''}</p>
                            <div className={`mt-1 flex items-center gap-1 text-[10px] ${isRight ? 'text-primary-100' : 'text-ink-muted'}`}>
                              <span>{parseMessageTime(message) ? new Date(parseMessageTime(message)).toLocaleString() : ''}</span>
                              <span>•</span>
                              <span>{t('adminChat.to', 'to')} {receiverLabel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            )}
          </Card>
        </div>
      )}
    </DirectionalWrapper>
  );
};

export default AdminChatManagementPage;