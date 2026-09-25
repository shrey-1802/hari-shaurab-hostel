export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hari-saurabh-backend.onrender.com/api';

export const ROLES = {
  MAIN_LEADER: 'MAIN_LEADER',
  WING_LEADER: 'WING_LEADER',
};

export const ROLE_LABELS = {
  [ROLES.MAIN_LEADER]: 'Main Leader (Full Access)',
  [ROLES.WING_LEADER]: 'Wing Leader (Floor Specific)',
};

export const FLOORS = [1, 2, 3, 4, 5];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Business Administration (MBA)',
  'Commerce & Finance',
  'Applied Sciences'
];

export const COLLEGES = [
  'National Institute of Technology',
  'Government Engineering College',
  'University Institute of Technology',
  'Apex Institute of Engineering',
  'City College of Science & Tech'
];

export const NOTIFICATION_TYPES = {
  BIRTHDAY_REMINDER: 'BIRTHDAY_REMINDER',
  BIRTHDAY_GREETING: 'BIRTHDAY_GREETING',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  NEW_STUDENT: 'NEW_STUDENT',
};

export const INITIAL_STUDENTS = [];
