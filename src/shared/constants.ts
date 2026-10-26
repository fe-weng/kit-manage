/** 默认小孩 ID（单用户模式下使用） */
export const DEFAULT_CHILD_ID = 'default'

/** 奖励分类列表 */
export const REWARD_CATEGORIES = ['娱乐', '美食', '玩具', '特权', '其他'] as const

/** 路由路径 */
export const ROUTES = {
  HOME: '/home',
  TASKS: '/tasks',
  TASKS_MANAGE: '/tasks/manage',
  PET: '/pet',
  PET_COLLECTION: '/pet/collection',
  SHOP: '/shop',
  MY_COUPONS: '/shop/coupons',
  REDEEM_HISTORY: '/shop/history',
  TASK_HISTORY: '/tasks/history',
  SETTINGS: '/settings',
  COLORING: '/coloring',
  COLORING_PAINT: '/coloring/paint/:templateId',
  COLORING_DRAFTS: '/coloring/drafts',
  COLORING_DRAFT: '/coloring/drafts/:draftId',
  COLORING_FINISHED: '/coloring/finished',
  COLORING_FINISHED_VIEW: '/coloring/finished/:finishedId',
} as const

export function coloringPaintPath(templateId: string): string {
  return `/coloring/paint/${encodeURIComponent(templateId)}`
}

export function coloringDraftPath(draftId: string): string {
  return `/coloring/drafts/${encodeURIComponent(draftId)}`
}

export function coloringFinishedPath(finishedId: string): string {
  return `/coloring/finished/${encodeURIComponent(finishedId)}`
}
