/**
 * Export centralisé de tous les composants
 * Import simplifié: import { Button, Card, PageHeader } from '@/presentation/components'
 */

// =============================================================================
// UI COMPONENTS (Atomic)
// =============================================================================
export {
  Button,
  LinkButton,
  Badge,
  StatusBadge,
  Card,
  CardHeader,
  Input,
  Textarea,
  Select,
  Spinner,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Divider,
  Label,
  Checkbox,
  FormError,
  FormSuccess,
  Modal,
  Pagination,
  type ModalProps,
  type PaginationProps,
} from './ui';

// =============================================================================
// COMPOSITE COMPONENTS
// =============================================================================
export {
  PageHeader,
  StatCard,
  StatsGrid,
  DataTable,
  TableCard,
  Tabs,
  Alert,
  Dropdown,
  ProgressBar,
  Avatar,
  type Column,
  type PageHeaderProps,
  type StatCardProps,
  type DataTableProps,
  type Tab,
  type TabsProps,
  type AlertProps,
  type DropdownItem,
  type DropdownProps,
  type ProgressBarProps,
  type AvatarProps,
} from './composite';

// =============================================================================
// FORM COMPONENTS
// =============================================================================
export {
  Form,
  FormSection,
  FormRow,
  FormActions,
  SearchInput,
  FilterSelect,
  FiltersBar,
  DateRangePicker,
  CheckboxGroup,
  RadioGroup,
  ServerActionForm,
  useForm,
  type FormState,
  type FormProps,
  type FormSectionProps,
  type FormRowProps,
  type FilterOption,
  type FilterSelectProps,
  type CheckboxOption,
  type CheckboxGroupProps,
  type RadioGroupProps,
} from './forms';

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================
export { MainLayout } from './layouts/MainLayout';
