
import { Employee, AttendanceRecord } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1001', name: '김대표', role: 'CEO', team: 'Management' },
  { id: '2001', name: '이수민', role: 'Frontend Engineer', team: 'Engineering' },
  { id: '2002', name: '박준호', role: 'Backend Engineer', team: 'Engineering' },
  { id: '3001', name: '최지우', role: 'Product Designer', team: 'Design' },
  { id: '4001', name: '정현우', role: 'Operations Manager', team: 'Operations' },
];

export const STORAGE_KEY_ATTENDANCE = 'worksync_attendance';
export const STORAGE_KEY_USER = 'worksync_current_user';

// Helper to generate historical dummy data
export const generateDummyData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  
  // Generate data for the last 365 days
  for (let i = 365; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends mostly (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (Math.random() > 0.1) continue; // 10% chance to work on weekend
    }

    const dateStr = date.toISOString().split('T')[0];

    MOCK_EMPLOYEES.forEach(emp => {
      // Randomize check-in (between 08:00 and 10:00)
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 60);
      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMin, 0);

      // Randomize duration (between 7.5 and 10 hours)
      const baseWorkMinutes = 450 + Math.floor(Math.random() * 150);
      const duration = emp.id === '1001' ? baseWorkMinutes + 60 : baseWorkMinutes; // CEO works more
      
      const checkOutTime = new Date(checkInTime.getTime() + duration * 60000);

      records.push({
        id: `dummy-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        checkIn: checkInTime.getTime(),
        checkOut: checkOutTime.getTime(),
        duration: duration,
        date: dateStr
      });
    });
  }
  return records;
};
