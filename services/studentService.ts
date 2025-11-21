
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student, CreateStudentDTO, ATTENDANCE_KEY_MAP, DayOfWeek, PaymentRecord } from '../types';

// --- HELPERS ---

// Get the most recent Saturday (start of the week)
const getMostRecentSaturday = (): string => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  
  // Calculate difference: if Sat(6) -> 0, Fri(5) -> 6, Sun(0) -> 1
  const diff = (day + 1) % 7; 
  
  const lastSaturday = new Date(now);
  lastSaturday.setDate(now.getDate() - diff);
  lastSaturday.setHours(0, 0, 0, 0);
  
  return lastSaturday.toISOString();
};

// Helper to generate past dates for mock data
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// --- MOCK DATA STORE ---

const currentWeekStart = getMostRecentSaturday();

let mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    hourly_rate: 150,
    days_of_week: ['Monday', 'Wednesday', 'Friday'],
    start_time: '14:00',
    end_time: '15:30',
    image_url: 'https://picsum.photos/200',
    paid_amount: 0,
    total_collected: 0, // Reset
    outstanding_balance: 0, // Reset
    last_week_start: currentWeekStart,
    monday_attended: false,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: false,
    saturday_attended: false,
    sunday_attended: false,
  },
  {
    id: '2',
    name: 'Bob Smith',
    hourly_rate: 200,
    days_of_week: ['Tuesday', 'Thursday'],
    start_time: '09:00',
    end_time: '10:00',
    image_url: 'https://picsum.photos/201',
    paid_amount: 0,
    total_collected: 0, // Reset
    outstanding_balance: 0, // Reset
    last_week_start: currentWeekStart,
    monday_attended: false,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: false,
    saturday_attended: false,
    sunday_attended: false,
  },
  {
    id: '3',
    name: 'Charlie Brown',
    hourly_rate: 100,
    days_of_week: ['Saturday', 'Sunday'],
    start_time: '16:00',
    end_time: '17:30',
    paid_amount: 0,
    total_collected: 0, // Reset
    outstanding_balance: 0, // Reset
    last_week_start: currentWeekStart,
    monday_attended: false,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: false,
    saturday_attended: false,
    sunday_attended: false,
  }
];

// Reset payments
let mockPayments: PaymentRecord[] = [];

// --- LOGIC: WEEKLY RESET ---

// Checks if the student record belongs to a previous week. If so, consolidates debt and resets.
const checkAndResetWeeklyAttendance = async (student: Student): Promise<Student> => {
  const currentSat = getMostRecentSaturday();
  // If last_week_start is missing or different from current week's Saturday
  if (!student.last_week_start || new Date(student.last_week_start).getTime() < new Date(currentSat).getTime()) {
    
    console.log(`Resetting attendance for ${student.name}. New Week: ${currentSat}`);

    // 1. Calculate Previous Week's Due
    let attendedCount = 0;
    Object.values(ATTENDANCE_KEY_MAP).forEach(key => {
      if (student[key]) attendedCount++;
    });
    
    const weekCost = attendedCount * student.hourly_rate;
    const weekPaid = student.paid_amount || 0;
    const netChange = weekCost - weekPaid; // Positive = Debt, Negative = Credit

    // 2. Prepare Updates
    const newOutstandingBalance = (student.outstanding_balance || 0) + netChange;
    
    const updates: Partial<Student> = {
      outstanding_balance: newOutstandingBalance,
      paid_amount: 0, // Reset for new cycle
      last_week_start: currentSat,
      monday_attended: false,
      tuesday_attended: false,
      wednesday_attended: false,
      thursday_attended: false,
      friday_attended: false,
      saturday_attended: false,
      sunday_attended: false,
    };

    // 3. Apply to DB or Mock
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', student.id);
      if (error) console.error('Error resetting student week:', error);
    } else {
      const index = mockStudents.findIndex(s => s.id === student.id);
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...updates };
      }
    }

    return { ...student, ...updates };
  }
  return student;
};


// --- API FUNCTIONS ---

export const fetchStudents = async (): Promise<Student[]> => {
  let students: Student[] = [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    students = data as Student[];
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    students = [...mockStudents];
  }

  // Check for weekly resets on read
  const processedStudents = await Promise.all(students.map(checkAndResetWeeklyAttendance));
  return processedStudents;
};

export const fetchStudentById = async (id: string): Promise<Student | undefined> => {
  let student: Student | undefined;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    student = data as Student;
  } else {
    await new Promise(resolve => setTimeout(resolve, 300));
    student = mockStudents.find(s => s.id === id);
  }

  if (student) {
    return await checkAndResetWeeklyAttendance(student);
  }
  return undefined;
};

export const createStudent = async (studentData: CreateStudentDTO): Promise<void> => {
  const defaults = {
    monday_attended: false,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: false,
    saturday_attended: false,
    sunday_attended: false,
    paid_amount: 0,
    total_collected: 0,
    outstanding_balance: 0,
    last_week_start: getMostRecentSaturday(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('students').insert([{
      ...studentData,
      ...defaults
    }]);
    if (error) throw error;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...studentData,
      ...defaults
    };
    mockStudents.push(newStudent);
  }
};

export const updateStudentAttendance = async (
  id: string, 
  updates: Partial<Record<keyof Student, boolean>>
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  } else {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...updates } as Student;
    }
  }
};

export const updateStudentDetails = async (id: string, data: CreateStudentDTO): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('students').update(data).eq('id', id);
    if (error) throw error;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...data };
    }
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockStudents = mockStudents.filter(s => s.id !== id);
  }
};

// --- Financial Services ---

export const fetchPayments = async (): Promise<PaymentRecord[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as PaymentRecord[];
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};

export const processPayment = async (id: string, amount: number): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    // 1. Get current student
    const { data: student, error: fetchError } = await supabase.from('students').select('paid_amount, total_collected, outstanding_balance').eq('id', id).single();
    if (fetchError) throw fetchError;

    // Logic: Payments cover outstanding balance first, then current cycle
    let remainingPayment = amount;
    let newOutstanding = student.outstanding_balance || 0;
    
    if (newOutstanding > 0) {
      const deduct = Math.min(newOutstanding, remainingPayment);
      newOutstanding -= deduct;
      remainingPayment -= deduct;
    } else if (newOutstanding < 0) {
        // If balance is negative (credit), we just add more credit technically, but logic keeps simple here
    }

    // Remaining goes to current cycle paid_amount
    const newPaidAmount = (student.paid_amount || 0) + remainingPayment;
    const newTotalCollected = (student.total_collected || 0) + amount;

    const { error: updateError } = await supabase
      .from('students')
      .update({ 
        paid_amount: newPaidAmount,
        total_collected: newTotalCollected,
        outstanding_balance: newOutstanding
      })
      .eq('id', id);
    if (updateError) throw updateError;

    // 3. Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{ 
        student_id: id, 
        amount: amount, 
        date: new Date().toISOString() 
      }]);
    if (paymentError) throw paymentError;

  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      const student = mockStudents[index];
      
      let remainingPayment = amount;
      let newOutstanding = student.outstanding_balance || 0;

      if (newOutstanding > 0) {
        const deduct = Math.min(newOutstanding, remainingPayment);
        newOutstanding -= deduct;
        remainingPayment -= deduct;
      }

      mockStudents[index].outstanding_balance = newOutstanding;
      mockStudents[index].paid_amount = (student.paid_amount || 0) + remainingPayment;
      mockStudents[index].total_collected = (student.total_collected || 0) + amount;
      
      mockPayments.push({
        id: Math.random().toString(36).substr(2, 9),
        student_id: id,
        student_name: student.name,
        amount: amount,
        date: new Date().toISOString()
      });
    }
  }
};
