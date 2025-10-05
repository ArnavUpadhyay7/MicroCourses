// Utility functions for consistent dark mode styling

export const getInputClasses = (baseClasses = '') => {
  return `${baseClasses} border-gray-300 dark:border-dark-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-800 transition-colors duration-200`;
};

export const getButtonClasses = (variant = 'primary') => {
  const baseClasses = 'transition-colors duration-200';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600`;
    case 'secondary':
      return `${baseClasses} bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600`;
    case 'danger':
      return `${baseClasses} bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600`;
    default:
      return baseClasses;
  }
};

export const getTextClasses = (variant = 'default') => {
  switch (variant) {
    case 'heading':
      return 'text-gray-900 dark:text-white';
    case 'subheading':
      return 'text-gray-700 dark:text-gray-300';
    case 'body':
      return 'text-gray-600 dark:text-gray-300';
    case 'muted':
      return 'text-gray-500 dark:text-gray-400';
    default:
      return 'text-gray-900 dark:text-white';
  }
};

export const getBackgroundClasses = (variant = 'default') => {
  switch (variant) {
    case 'page':
      return 'bg-gray-50 dark:bg-dark-900';
    case 'card':
      return 'bg-white dark:bg-dark-800';
    case 'section':
      return 'bg-white dark:bg-dark-800';
    case 'muted':
      return 'bg-gray-100 dark:bg-dark-700';
    default:
      return 'bg-white dark:bg-dark-800';
  }
};

export const getBorderClasses = (variant = 'default') => {
  switch (variant) {
    case 'default':
      return 'border-gray-200 dark:border-dark-600';
    case 'input':
      return 'border-gray-300 dark:border-dark-600';
    default:
      return 'border-gray-200 dark:border-dark-600';
  }
};
