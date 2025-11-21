
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student, CreateStudentDTO, ATTENDANCE_KEY_MAP, DayOfWeek } from '../types';

// --- MOCK DATA STORE (For when Supabase is not configured) ---
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
    monday_attended: true,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: true,
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
    paid_amount: 100, // Partially paid
    monday_attended: false,
    tuesday_attended: true,
    wednesday_attended: false,
    thursday_attended: true,
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
    monday_attended: false,
    tuesday_attended: false,
    wednesday_attended: false,
    thursday_attended: false,
    friday_attended: false,
    saturday_attended: true,
    sunday_attended: false,
  }
];

// --- API FUNCTIONS ---

export const fetchStudents = async (): Promise<Student[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Student[];
  } else {
    // Mock Fallback
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    return [...mockStudents];
  }
};

export const fetchStudentById = async (id: string): Promise<Student | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Student;
  } else {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStudents.find(s => s.id === id);
  }
};

export const createStudent = async (student: CreateStudentDTO): Promise<Student> => {
  if (isSupabaseConfigured && supabase) {
    const newStudent = {
      ...student,
      paid_amount: 0,
      monday_attended: false,
      tuesday_attended: false,
      wednesday_attended: false,
      thursday_attended: false,
      friday_attended: false,
      saturday_attended: false,
      sunday_attended: false,
      last_session_time: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('students')
      .insert(newStudent)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  } else {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newId = Math.random().toString(36).substring(2, 9);
    const newEntry: Student = {
      id: newId,
      name: student.name,
      hourly_rate: student.hourly_rate,
      days_of_week: student.days_of_week,
      image_url: student.image_url,
      start_time: student.start_time,
      end_time: student.end_time,
      paid_amount: 0,
      monday_attended: false,
      tuesday_attended: false,
      wednesday_attended: false,
      thursday_attended: false,
      friday_attended: false,
      saturday_attended: false,
      sunday_attended: false,
      last_session_time: new Date().toISOString(),
    };
    mockStudents.push(newEntry);
    return newEntry;
  }
};

export const updateStudentAttendance = async (
  id: string, 
  attendanceUpdates: Partial<Record<keyof Student, boolean>>
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('students')
      .update(attendanceUpdates)
      .eq('id', id);
    
    if (error) throw error;
  } else {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...attendanceUpdates as unknown as Partial<Student> };
    }
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    mockStudents = mockStudents.filter(s => s.id !== id);
  }
};

export const processPayment = async (id: string, amount: number): Promise<void> => {
  const student = await fetchStudentById(id);
  if (!student) throw new Error('Student not found');

  // Calculate total cost of current attendance
  let attendedCount = 0;
  (Object.values(ATTENDANCE_KEY_MAP) as (keyof Student)[]).forEach(key => {
    if (student[key] === true) attendedCount++;
  });
  
  const totalCost = attendedCount * student.hourly_rate;
  const newPaidAmount = (student.paid_amount || 0) + amount;

  // Logic: If paid amount covers the debt, reset the cycle
  if (newPaidAmount >= totalCost) {
    // RESET CYCLE
    const resetUpdates: any = {
      paid_amount: 0, // Reset paid tracker
      monday_attended: false,
      tuesday_attended: false,
      wednesday_attended: false,
      thursday_attended: false,
      friday_attended: false,
      saturday_attended: false,
      sunday_attended: false,
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('students').update(resetUpdates).eq('id', id);
      if (error) throw error;
    } else {
       await new Promise(resolve => setTimeout(resolve, 500));
       const index = mockStudents.findIndex(s => s.id === id);
       if (index !== -1) {
         mockStudents[index] = { ...mockStudents[index], ...resetUpdates };
       }
    }

  } else {
    // PARTIAL PAYMENT
    const update = { paid_amount: newPaidAmount };
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('students').update(update).eq('id', id);
      if (error) throw error;
    } else {
       await new Promise(resolve => setTimeout(resolve, 500));
       const index = mockStudents.findIndex(s => s.id === id);
       if (index !== -1) {
         mockStudents[index] = { ...mockStudents[index], paid_amount: newPaidAmount };
       }
    }
  }
};
