/**
 * Date formatting & birthday calculation helpers
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export const validateDOBNotFuture = (dobString) => {
  if (!dobString) return 'Date of birth is compulsory.';
  const dob = new Date(dobString);
  const now = new Date();
  if (dob >= now || dob.getFullYear() > now.getFullYear()) {
    return 'Date of birth cannot be in the future or exceed current year.';
  }
  return null;
};

export const formatBirthdayDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const getDaysUntilBirthday = (dobString) => {
  if (!dobString) return 999;
  const dob = new Date(dobString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let target = new Date(today.getFullYear(), dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
  if (target.getTime() < today.getTime()) {
    target = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
  }

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const isBirthdayToday = (dobString) => {
  return getDaysUntilBirthday(dobString) === 0;
};

export const isBirthdayTomorrow = (dobString) => {
  return getDaysUntilBirthday(dobString) === 1;
};

export const isBirthdayThisWeek = (dobString) => {
  const days = getDaysUntilBirthday(dobString);
  return days >= 0 && days <= 7;
};

export const isBirthdayApproaching = (dobString) => {
  const days = getDaysUntilBirthday(dobString);
  return days === 0 || days === 1;
};

export const getNextBirthdayDate = (dobString) => {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let target = new Date(today.getFullYear(), dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
  if (target.getTime() < today.getTime()) {
    target = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
  }

  return target.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getBirthdayBadgeInfo = (dobString) => {
  const days = getDaysUntilBirthday(dobString);
  if (days === 0) {
    return {
      type: 'today',
      label: 'Today 🎂',
      shortLabel: 'Today',
      countdownText: 'Today',
      isToday: true,
      isTomorrow: false,
      badgeVariant: 'gold',
      badgeClass: 'bg-gold-500 text-white font-extrabold shadow-gold-glow animate-pulse',
    };
  }
  if (days === 1) {
    return {
      type: 'tomorrow',
      label: 'Tomorrow 🎈',
      shortLabel: 'Tomorrow',
      countdownText: '1 Day Left',
      isToday: false,
      isTomorrow: true,
      badgeVariant: 'gold',
      badgeClass: 'bg-gold-100 text-gold-800 border border-gold-300 font-bold',
    };
  }
  return {
    type: 'upcoming',
    label: `In ${days} Days`,
    shortLabel: `${days} Days`,
    countdownText: `${days} Days Left`,
    isToday: false,
    isTomorrow: false,
    badgeVariant: 'gray',
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium',
  };
};

export const cleanWhatsAppNumber = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
};

export const getWhatsAppUrl = (phone, message = '') => {
  const cleanPhone = cleanWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  if (message && message.trim()) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
  }
  return `https://wa.me/${cleanPhone}`;
};

export const getInitials = (name) => {
  if (!name) return 'HS';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

