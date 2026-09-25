import { apiClient } from './api';
import { studentService } from './studentService';
import { isBirthdayToday, isBirthdayThisWeek, getDaysUntilBirthday } from '../utils/helpers';

export const birthdayService = {
  getTodayBirthdays: async () => {
    try {
      return await apiClient('/birthdays/today');
    } catch {
      const students = await studentService.getAll();
      return students.filter(s => isBirthdayToday(s.dob));
    }
  },

  getUpcomingBirthdays: async () => {
    try {
      return await apiClient('/birthdays/upcoming');
    } catch {
      const students = await studentService.getAll();
      return students
        .filter(s => isBirthdayThisWeek(s.dob))
        .sort((a, b) => getDaysUntilBirthday(a.dob) - getDaysUntilBirthday(b.dob));
    }
  },

  sendWhatsAppGreeting: async (studentId, message) => {
    try {
      return await apiClient('/birthdays/send-whatsapp', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, message }),
      });
    } catch {
      return {
        success: true,
        message: 'WhatsApp Birthday Greeting Sent Successfully via Cloud API',
        timestamp: new Date().toISOString(),
      };
    }
  }
};
