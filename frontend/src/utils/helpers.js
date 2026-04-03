/**
 * Format a number as currency (INR by default).
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format a date string.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Short month names.
 */
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Predefined category options.
 */
export const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business',
  'Food', 'Rent', 'Utilities', 'Transport', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Insurance', 'Other',
];

/**
 * Chart color palette.
 */
export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#a855f7', '#e11d48', '#84cc16',
];

/**
 * Truncate text to a max length.
 */
export const truncate = (str, maxLen = 40) => {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
};
