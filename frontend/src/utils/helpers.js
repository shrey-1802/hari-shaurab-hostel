/**
 * Date formatting & birthday calculation helpers
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const isBirthdayToday = (dobString) => {
  if (!dobString) return false;
  const dob = new Date(dobString);
  const today = new Date();
  return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
};

export const isBirthdayThisWeek = (dobString) => {
  if (!dobString) return false;
  const dob = new Date(dobString);
  const today = new Date();
  
  // Set dob to current year for comparison
  const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  
  const diffTime = thisYearBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= 7;
};

export const getDaysUntilBirthday = (dobString) => {
  if (!dobString) return 999;
  const dob = new Date(dobString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let target = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (target.getTime() < today.getTime()) {
    target = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getInitials = (name) => {
  if (!name) return 'HS';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
