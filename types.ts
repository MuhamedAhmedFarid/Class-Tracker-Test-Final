
export interface Student {
  id: string;
  name: string;
  image_url?: string;
  hourly_rate: number;
  days_of_week: string[]; // e.g., ['Monday', 'Wednesday']
  start_time?: string; // 'HH:mm' 24h format
  end_time?: string;   // 'HH:mm' 24h format
  last_session_time?: string;
  
  // Financials
  paid_amount: number; // Amount paid towards the current cycle (resets on week reset)
  total_collected: number; // Lifetime amount collected from this student
  outstanding_balance: number; // Debt/Credit carried over from previous weeks
  last_week_start?: string; // ISO Date of the Saturday the current cycle belongs to

  // Attendance columns
  monday_attended: boolean;
  tuesday_attended: boolean;
  wednesday_attended: boolean;
  thursday_attended: boolean;
  friday_attended: boolean;
  saturday_attended: boolean;
  sunday_attended: boolean;
}

export interface CreateStudentDTO {
  name: string;
  hourly_rate: number;
  days_of_week: string[];
  image_url?: string;
  start_time?: string;
  end_time?: string;
}

export interface PaymentRecord {
  id: string;
  student_id: string;
  amount: number;
  date: string; // ISO String
  student_name?: string; // For display convenience
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Helper to map DB columns to days
export const ATTENDANCE_KEY_MAP: Record<DayOfWeek, keyof Student> = {
  Monday: 'monday_attended',
  Tuesday: 'tuesday_attended',
  Wednesday: 'wednesday_attended',
  Thursday: 'thursday_attended',
  Friday: 'friday_attended',
  Saturday: 'saturday_attended',
  Sunday: 'sunday_attended',
};
