// Utility functions for the blog application

/**
 * Calculate estimated reading time for a blog post
 * @param {string} content - The blog post content
 * @param {number} wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns {number} Estimated reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content || typeof content !== 'string') return 0;
  
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Count words
  const wordCount = cleanContent.split(' ').filter(word => word.length > 0).length;
  
  // Calculate reading time
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Format reading time for display
 * @param {number} minutes - Reading time in minutes
 * @returns {string} Formatted reading time string
 */
export function formatReadingTime(minutes) {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

/**
 * Generate social sharing URLs
 * @param {Object} post - Blog post object
 * @param {string} currentUrl - Current page URL
 * @returns {Object} Object containing sharing URLs for different platforms
 */
export function generateSharingUrls(post, currentUrl) {
  const title = encodeURIComponent(post.title || '');
  const excerpt = encodeURIComponent(post.excerpt || '');
  const url = encodeURIComponent(currentUrl);
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
    email: `mailto:?subject=${title}&body=${excerpt}%0A%0A${url}`,
    copy: currentUrl
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format date for comments (shorter format)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatCommentDate(dateString) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get user initials from user object
 * @param {Object} user - User object
 * @returns {string} User initials
 */
export function getUserInitials(user) {
  if (!user) return "U";
  const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return "U";
}

/**
 * Resolve avatar URL with proper base URL
 * @param {string} url - Avatar URL
 * @returns {string} Resolved avatar URL
 */
export function resolveAvatarUrl(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000${url}`;
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit API calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}