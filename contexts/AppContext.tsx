import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'ar';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    students: 'Students',
    reports: 'Reports',
    settings: 'Settings',
    
    // Home
    todaysClasses: "Today's Classes",
    noClasses: 'No Classes Today',
    enjoyDayOff: 'Enjoy your day off!',
    totalStudents: 'Total Students',
    pending: 'Pending',
    noTimeSet: 'No time set',
    
    // Students List
    searchPlaceholder: 'Search students...',
    addStudent: 'Add New Student',
    noStudentsFound: 'No students found.',
    rateFilter50: '> 50 EGP',
    rateFilter100: '> 100 EGP',
    
    // Student Details
    studentDetails: 'Student Details',
    totalDue: 'Total Due',
    includesPastDue: 'Includes past due',
    attendance: 'Attendance',
    currentWeek: 'Current Week',
    present: 'Present',
    absent: 'Absent',
    saveChanges: 'Save Changes',
    editStudent: 'Edit Student',
    deleteStudent: 'Delete Student',
    deleteConfirm: 'Are you sure you want to delete this student? This action cannot be undone.',
    
    // Forms
    addNewStudent: 'Add New Student',
    updateStudent: 'Update Student',
    createStudent: 'Create Student',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. John Doe',
    hourlyRate: 'Hourly Rate (EGP)',
    startTime: 'Start Time',
    endTime: 'End Time',
    scheduleDays: 'Schedule Days',
    cancel: 'Cancel',
    
    // Reports & Financials
    financials: 'Financial Reports',
    totalCollected: 'Total Collected',
    lifetimeCollected: 'Lifetime Collected',
    transactionHistory: 'Transaction History',
    studentsWithDue: 'Students with Due Payments',
    collected: 'Collected',
    due: 'Due',
    customRange: 'Custom Range',
    currentMonth: 'Current Month',
    lastMonth: 'Last Month',
    allTime: 'All Time',
    startDate: 'Start Date',
    endDate: 'End Date',
    tapDetails: 'Tap for details',
    settled: 'Settled',
    classesWeek: 'Classes (Week)',
    allSettled: 'All Settled!',
    noOutstanding: 'No outstanding payments found.',
    noPaymentsPeriod: 'No payments found for this period.',
    unknownStudent: 'Unknown Student',
    
    // Student Financial Report
    cycleCost: 'Cycle Cost',
    outstanding: 'Outstanding',
    carriedOver: 'Carried over',
    pay: 'Pay',
    recordPayment: 'Record Payment',
    remainingDue: 'Remaining Due',
    receivedAmount: 'Received Amount',
    fullAmount: 'Full Amount',
    confirmPayment: 'Confirm Payment',
    schedule: 'Schedule',
    scheduledDay: 'Scheduled Day',
    today: 'Today',
    
    // Settings
    language: 'Language',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    
    // Common
    egp: 'EGP',
    rate: 'Rate',
    
    // Days (Short)
    Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun',
    // Days (Long)
    Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    students: 'الطلاب',
    reports: 'التقارير',
    settings: 'الإعدادات',
    
    // Home
    todaysClasses: 'حصص اليوم',
    noClasses: 'لا توجد حصص اليوم',
    enjoyDayOff: 'استمتع بيوم عطلتك!',
    totalStudents: 'إجمالي الطلاب',
    pending: 'قيد الانتظار',
    noTimeSet: 'لم يحدد وقت',
    
    // Students List
    searchPlaceholder: 'بحث عن طالب...',
    addStudent: 'إضافة طالب جديد',
    noStudentsFound: 'لا يوجد طلاب.',
    rateFilter50: '> 50 ج.م',
    rateFilter100: '> 100 ج.م',
    
    // Student Details
    studentDetails: 'تفاصيل الطالب',
    totalDue: 'إجمالي المستحق',
    includesPastDue: 'يتضمن مستحقات سابقة',
    attendance: 'تسجيل الحضور',
    currentWeek: 'الأسبوع الحالي',
    present: 'حاضر',
    absent: 'غائب',
    saveChanges: 'حفظ التغييرات',
    editStudent: 'تعديل الطالب',
    deleteStudent: 'حذف الطالب',
    deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.',
    
    // Forms
    addNewStudent: 'إضافة طالب جديد',
    updateStudent: 'تحديث بيانات الطالب',
    createStudent: 'إنشاء طالب',
    fullName: 'الاسم بالكامل',
    fullNamePlaceholder: 'مثال: أحمد محمد',
    hourlyRate: 'سعر الساعة (ج.م)',
    startTime: 'وقت البدء',
    endTime: 'وقت الانتهاء',
    scheduleDays: 'أيام الجدول',
    cancel: 'إلغاء',
    
    // Reports & Financials
    financials: 'التقارير المالية',
    totalCollected: 'إجمالي المحصل',
    lifetimeCollected: 'إجمالي التحصيل',
    transactionHistory: 'سجل المعاملات',
    studentsWithDue: 'طلاب عليهم مستحقات',
    collected: 'المحصل',
    due: 'المستحق',
    customRange: 'فترة مخصصة',
    currentMonth: 'الشهر الحالي',
    lastMonth: 'الشهر الماضي',
    allTime: 'كل الوقت',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    tapDetails: 'اضغط للتفاصيل',
    settled: 'تمت التسوية',
    classesWeek: 'حصص (أسبوعيًا)',
    allSettled: 'الكل خالص!',
    noOutstanding: 'لا توجد مستحقات متأخرة.',
    noPaymentsPeriod: 'لا توجد مدفوعات في هذه الفترة.',
    unknownStudent: 'طالب غير معروف',
    
    // Student Financial Report
    cycleCost: 'تكلفة الدورة',
    outstanding: 'مستحقات متأخرة',
    carriedOver: 'مرحل من سابق',
    pay: 'دفع',
    recordPayment: 'تسجيل دفع',
    remainingDue: 'المتبقي',
    receivedAmount: 'المبلغ المستلم',
    fullAmount: 'المبلغ كامل',
    confirmPayment: 'تأكيد الدفع',
    schedule: 'الجدول',
    scheduledDay: 'يوم مجدول',
    today: 'اليوم',
    
    // Settings
    language: 'اللغة',
    appearance: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    
    // Common
    egp: 'ج.م',
    rate: 'السعر',
    
    // Days (Short)
    Mon: 'إثنين', Tue: 'ثلاثاء', Wed: 'أربعاء', Thu: 'خميس', Fri: 'جمعة', Sat: 'سبت', Sun: 'أحد',
    // Days (Long)
    Monday: 'الإثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Handle Language Change (RTL)
  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};