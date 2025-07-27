import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Blood group utilities
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPATIBILITY = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

export const BLOOD_RECIPIENTS = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export const getCompatibleDonors = (bloodGroup) => {
  return BLOOD_RECIPIENTS[bloodGroup] || [];
};

export const getCompatibleRecipients = (bloodGroup) => {
  return BLOOD_COMPATIBILITY[bloodGroup] || [];
};

// Date utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, formatString);
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const getDaysSince = (date) => {
  if (!date) return 0;
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 0;
  
  const now = new Date();
  const diffTime = Math.abs(now - parsedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const canDonateAgain = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  
  const daysSince = getDaysSince(lastDonationDate);
  return daysSince >= 56; // 8 weeks minimum gap
};

export const getNextDonationDate = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  
  const parsedDate = typeof lastDonationDate === 'string' ? parseISO(lastDonationDate) : lastDonationDate;
  if (!isValid(parsedDate)) return null;
  
  const nextDate = new Date(parsedDate);
  nextDate.setDate(nextDate.getDate() + 56);
  return nextDate;
};

// Status utilities
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    fulfilled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    partially_fulfilled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const getUrgencyColor = (urgency) => {
  const urgencyColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  return urgencyColors[urgency] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const getStockStatusColor = (status) => {
  const statusColors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    adequate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  return numAge >= 18 && numAge <= 65;
};

// Number formatting utilities
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
  }
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

