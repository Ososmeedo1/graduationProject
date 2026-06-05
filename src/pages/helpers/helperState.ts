export function deriveHelperState(helper: any) {
  const approvalStatus = String(
    helper?.approvalStatus || helper?.status || ''
  ).toLowerCase();

  let accountStatus: 'inactive' | 'active' | 'suspended' = 'inactive';

  if (helper?.isSuspended) accountStatus = 'suspended';
  else if (helper?.isActive) accountStatus = 'active';

  const isBanned = Boolean(helper?.isBanned);

  return {
    approvalStatus,
    accountStatus,
    isBanned,
  };
}

export function getAllowedActions(state: ReturnType<typeof deriveHelperState>) {
  const { approvalStatus, accountStatus, isBanned } = state;

  // Strict lifecycle state machine enforcement
  // PENDING -> UNDER_REVIEW -> APPROVED (ACTIVE MANAGEMENT)

  const isPending = approvalStatus === 'pending';
  const isUnderReview = approvalStatus === 'underreview';
  const isApproved = approvalStatus === 'approved'; // Changed to 'approved' only, assuming 'active' is an accountStatus within 'approved' approvalStatus.

  // PENDING STATE
  const canMarkUnderReview = isPending;
  
  // UNDER_REVIEW STATE
  const canApprove = isUnderReview;
  const canReject = isUnderReview;
  const canRequestChanges = isUnderReview;

  // APPROVED / ACTIVE MANAGEMENT STATE
  // These actions are only allowed if the helper's approvalStatus is 'approved'
  const canActivate = isApproved && !isBanned && (accountStatus === 'inactive' || accountStatus === 'suspended');
  const canSuspend = isApproved && !isBanned && accountStatus === 'active';
  const canBan = isApproved && !isBanned;
  const canUnban = isBanned; // Unban is allowed only if the helper is currently banned.

  return {
    // PENDING STATE: Only allow moving to review
    canMarkUnderReview,
    
    // UNDER_REVIEW STATE: Approval workflow actions
    canApprove,
    canReject,
    canRequestChanges,

    // APPROVED STATE: Active management actions
    canActivate,
    canSuspend,
    canBan,
    canUnban,
  };
}
