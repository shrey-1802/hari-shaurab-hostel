export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hari-saurabh-backend.onrender.com/api';

export const ROLES = {
  MAIN_LEADER: 'MAIN_LEADER',
  WING_LEADER: 'WING_LEADER',
};

export const ROLE_LABELS = {
  [ROLES.MAIN_LEADER]: 'Main Leader (Full Access)',
  [ROLES.WING_LEADER]: 'Wing Leader (Floor Specific)',
};

export const FLOORS = [4, 6];

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
  'Hari-Saurabh Institute of Technology'
];

export const NOTIFICATION_TYPES = {
  BIRTHDAY_REMINDER: 'BIRTHDAY_REMINDER',
  BIRTHDAY_ALERT: 'BIRTHDAY_ALERT',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  NEW_STUDENT: 'NEW_STUDENT',
};

const getRelativeDOB = (daysOffset, birthYear = 2003) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
};

export const INITIAL_STUDENTS = [
  {
    id: 'stu-01',
    full_name: 'Rahul Patel',
    floor_number: 2,
    room_number: '602',
    dob: getRelativeDOB(1, 2003), // Birthday Tomorrow! (1 Day Before)
    student_mobile: '9876543210',
    whatsapp_number: '9876543210',
    parent_name: 'Mahesh Patel',
    parent_mobile: '9822334455',
    college_name: 'National Institute of Technology',
    department: 'Computer Science & Engineering',
    semester_result: '9.4 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Aman Sharma (Room 203), Yash Patel (Room 205)',
    non_hostel_friends: 'Vikas Shah, Kunal Verma (NIT CS Branch)',
    hobby: 'Chess, Competitive Coding & Badminton',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stu-02',
    full_name: 'Aarav Mehta',
    floor_number: 2,
    room_number: '204',
    dob: getRelativeDOB(0, 2002), // Birthday Today!
    student_mobile: '919876543211',
    whatsapp_number: '919876543211',
    parent_name: 'Sanjay Mehta',
    parent_mobile: '9876500001',
    college_name: 'Government Engineering College',
    department: 'Information Technology',
    semester_result: '8.9 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Dev Patel (Room 201), Rahul Patel (Room 602)',
    non_hostel_friends: 'Harsh Gupta, Nehal Sen',
    hobby: 'Cricket, Acoustic Guitar & UI Design',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stu-03',
    full_name: 'Ananya Sharma',
    floor_number: 1,
    room_number: '108',
    dob: getRelativeDOB(3, 2003), // Birthday in 3 days
    student_mobile: '9876543212',
    whatsapp_number: '9876543212',
    parent_name: 'Ramesh Sharma',
    parent_mobile: '9876500002',
    college_name: 'University Institute of Technology',
    department: 'Electronics & Communication',
    semester_result: '9.1 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Priya Joshi (Room 106), Sneha Roy (Room 102)',
    non_hostel_friends: 'Meera Dave, Tanvi Bhatt',
    hobby: 'Robotics, IoT Projects & Reading Novels',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stu-04',
    full_name: 'Devanshu Verma',
    floor_number: 3,
    room_number: '305',
    dob: getRelativeDOB(5, 2002), // Birthday in 5 days
    student_mobile: '9876543213',
    whatsapp_number: '9876543213',
    parent_name: 'Pradeep Verma',
    parent_mobile: '9876500003',
    college_name: 'Apex Institute of Engineering',
    department: 'Mechanical Engineering',
    semester_result: '8.6 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Karan Shah (Room 301), Rohan Patel (Room 303)',
    non_hostel_friends: 'Sahil Kulkarni, Aditya Joshi',
    hobby: '3D Printing, Automotive Design & Football',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stu-05',
    full_name: 'Pooja Iyer',
    floor_number: 4,
    room_number: '412',
    dob: getRelativeDOB(12, 2004),
    student_mobile: '9876543214',
    whatsapp_number: '9876543214',
    parent_name: 'K. Venkatesh Iyer',
    parent_mobile: '9876500004',
    college_name: 'City College of Science & Tech',
    department: 'Business Administration (MBA)',
    semester_result: '9.6 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Deepa Nair (Room 410), Simran Kaur (Room 408)',
    non_hostel_friends: 'Shruti Hegde',
    hobby: 'Stock Market Analytics, Classical Dance & Debate',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stu-06',
    full_name: 'Siddharth Nair',
    floor_number: 5,
    room_number: '502',
    dob: getRelativeDOB(20, 2003),
    student_mobile: '9876543215',
    whatsapp_number: '9876543215',
    parent_name: 'N. Raghavan Nair',
    parent_mobile: '9876500005',
    college_name: 'National Institute of Technology',
    department: 'Civil Engineering',
    semester_result: '8.4 CGPA',
    profile_image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    hostel_friends: 'Manish Rawat (Room 501), Jayesh Purohit (Room 504)',
    non_hostel_friends: 'Chirag Seth',
    hobby: 'Structural Architecture, Table Tennis & Cycling',
    created_at: new Date().toISOString(),
  },
];

