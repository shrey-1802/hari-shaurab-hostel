import { apiClient } from './api';
import { studentService } from './studentService';
import {
  isBirthdayToday,
  isBirthdayTomorrow,
  isBirthdayThisWeek,
  getDaysUntilBirthday,
  getWhatsAppUrl,
} from '../utils/helpers';

/**
 * Birthday Service
 * 
 * IMPORTANT: DO NOT send WhatsApp messages automatically.
 * Supports querying upcoming birthdays (Today and Tomorrow) and formatting manual WhatsApp chat redirects.
 */
export const birthdayService = {
  getTodayBirthdays: async () => {
    try {
      return await apiClient('/birthdays/today');
    } catch {
      const students = await studentService.getAll();
      return students.filter((s) => isBirthdayToday(s.dob));
    }
  },

  getTomorrowBirthdays: async () => {
    try {
      return await apiClient('/birthdays/tomorrow');
    } catch {
      const students = await studentService.getAll();
      return students.filter((s) => isBirthdayTomorrow(s.dob));
    }
  },

  getUpcomingBirthdays: async () => {
    try {
      return await apiClient('/birthdays/upcoming');
    } catch {
      const students = await studentService.getAll();
      return students
        .filter((s) => isBirthdayThisWeek(s.dob))
        .sort((a, b) => getDaysUntilBirthday(a.dob) - getDaysUntilBirthday(b.dob));
    }
  },

  /**
   * Helper to format manual WhatsApp wish redirect link
   * Redirect to: https://wa.me/{student_phone_number}
   */
  getManualWhatsAppUrl: (studentPhone, message = '') => {
    return getWhatsAppUrl(studentPhone, message);
  },
};

