/**
 * Admin contract references are defined in:
 * - specs/002-admin-control-suite/contracts/admin-audit.md
 * - specs/002-admin-control-suite/contracts/admin-dashboard.md
 * - specs/002-admin-control-suite/contracts/admin-management.md
 * - specs/002-admin-control-suite/contracts/admin-reports.md
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} role
 * @property {boolean} [isActive]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} AdminPermission
 * @property {string} key
 * @property {string} module
 * @property {string} action
 */

/**
 * @typedef {Object} AdminAuthPayload
 * @property {string} token
 * @property {AdminUser} user
 * @property {AdminPermission[]} [permissions]
 */

/**
 * @typedef {Object} AuditLogQuery
 * @property {string} [TargetType]
 * @property {string} [TargetId]
 * @property {string} [AdminId]
 * @property {string} [Action]
 * @property {number} [Page]
 * @property {number} [PageSize]
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} action
 * @property {string} targetType
 * @property {string} [targetId]
 * @property {string} [adminId]
 * @property {string} [adminName]
 * @property {string} createdAt
 * @property {string} [result]
 */

/**
 * @typedef {Object} PagedResponseMeta
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} [totalPages]
 */

/**
 * @typedef {Object} PagedResponse
 * @property {Array<any>} data
 * @property {PagedResponseMeta} meta
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} [totalHelpers]
 * @property {number} [pendingReviews]
 * @property {number} [approvedHelpers]
 * @property {number} [activeHelpers]
 * @property {number} [suspendedHelpers]
 * @property {number} [bannedHelpers]
 */

/**
 * @typedef {Object} ReportItem
 * @property {string} id
 * @property {boolean} [isResolved]
 * @property {string} [createdAt]
 * @property {string} [resolutionNote]
 */

/**
 * @typedef {Object} ProblemDetails
 * @property {string} [type]
 * @property {string} [title]
 * @property {number} [status]
 * @property {string} [detail]
 * @property {string} [instance]
 */

export { };
