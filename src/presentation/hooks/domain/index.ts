/**
 * Export centralisé des hooks domain
 */

export {
  useServerAction,
  useServerActions,
  type ServerActionResult,
  type ServerAction,
  type UseServerActionReturn,
} from './useServerAction';

export {
  useFilters,
  useFiltersWithSearch,
  useFiltersWithStats,
  type FilterValue,
  type FilterConfig,
  type FilterDefinition,
  type UseFiltersOptions,
  type UseFiltersReturn,
} from './useFilters';

export {
  usePartRequests,
  usePartRequestsByUser,
  usePendingPartRequests,
  PART_REQUEST_STATUS_CONFIG,
  PART_REQUEST_URGENCY_CONFIG,
  type PartRequest,
  type PartRequestStats,
  type UsePartRequestsOptions,
  type UsePartRequestsReturn,
} from './usePartRequests';

export {
  useWorkOrders,
  useWorkOrdersByTechnician,
  useUrgentWorkOrders,
  WORK_ORDER_STATUS_CONFIG,
  WORK_ORDER_PRIORITY_CONFIG,
  WORK_ORDER_TYPE_CONFIG,
  type WorkOrder,
  type WorkOrderStats,
  type WorkOrderStatusFilter,
  type WorkOrderPriorityFilter,
  type WorkOrderTypeFilter,
  type UseWorkOrdersOptions,
  type UseWorkOrdersReturn,
} from './useWorkOrders';
