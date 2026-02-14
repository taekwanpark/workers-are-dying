
import { AttendanceRecord, WorkTimeData } from '../types';
import { STORAGE_KEY_ATTENDANCE, MOCK_EMPLOYEES, generateDummyData } from '../constants';

// OECD Reference values (Annual basis approx)
// Avg: ~1752h, Min (Germany): ~1340h, Max (Mexico/Colombia): ~2200h
const OECD_YEARLY = { avg: 1752, min: 1340, max: 2206 };
const OECD_MONTHLY = { avg: 146, min: 111.7, max: 183.8 };
const OECD_DAILY = { avg: 6.7, min: 5.2, max: 8.5 };

export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
  if (!data) {
    const dummyData = generateDummyData();
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(dummyData));
    return dummyData;
  }
  return JSON.parse(data);
};

export const saveAttendanceRecord = (record: AttendanceRecord) => {
  const records = getAttendanceRecords();
  const existingIdx = records.findIndex(r => r.id === record.id);
  if (existingIdx > -1) {
    records[existingIdx] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
};

export const calculatePersonalDailyData = (employeeId: string, days: number = 7): WorkTimeData[] => {
  const records = getAttendanceRecords();
  const data: WorkTimeData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const personalRecord = records.find(r => r.employeeId === employeeId && r.date === dateStr);
    const teamRecords = records.filter(r => r.date === dateStr);
    
    const personalHours = personalRecord?.duration ? personalRecord.duration / 60 : 0;
    const totalTeamHours = teamRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
    const teamAverageHours = teamRecords.length > 0 ? totalTeamHours / MOCK_EMPLOYEES.length : 0;

    data.push({
      label: dateStr.slice(5),
      personalHours: parseFloat(personalHours.toFixed(1)),
      teamAverageHours: parseFloat(teamAverageHours.toFixed(1)),
      totalTeamHours: parseFloat(totalTeamHours.toFixed(1)),
      oecdAvg: OECD_DAILY.avg,
      oecdMin: OECD_DAILY.min,
      oecdMax: OECD_DAILY.max
    });
  }
  return data;
};

export const calculateMonthlyData = (employeeId: string, months: number = 6): WorkTimeData[] => {
  const records = getAttendanceRecords();
  const data: WorkTimeData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const personalMonthRecords = records.filter(r => r.employeeId === employeeId && r.date.startsWith(monthKey));
    const teamMonthRecords = records.filter(r => r.date.startsWith(monthKey));

    const personalHours = personalMonthRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
    const totalTeamHours = teamMonthRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
    const teamAverageHours = totalTeamHours / MOCK_EMPLOYEES.length;

    data.push({
      label: `${d.getMonth() + 1}월`,
      personalHours: parseFloat(personalHours.toFixed(1)),
      teamAverageHours: parseFloat(teamAverageHours.toFixed(1)),
      totalTeamHours: parseFloat(totalTeamHours.toFixed(1)),
      oecdAvg: OECD_MONTHLY.avg,
      oecdMin: OECD_MONTHLY.min,
      oecdMax: OECD_MONTHLY.max
    });
  }
  return data;
};

export const calculateYearlyData = (employeeId: string): WorkTimeData[] => {
  const records = getAttendanceRecords();
  const data: WorkTimeData[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 2; i >= 0; i--) {
    const year = currentYear - i;
    const yearKey = year.toString();
    
    const personalYearRecords = records.filter(r => r.employeeId === employeeId && r.date.startsWith(yearKey));
    const teamYearRecords = records.filter(r => r.date.startsWith(yearKey));

    const personalHours = personalYearRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
    const totalTeamHours = teamYearRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
    const teamAverageHours = totalTeamHours / MOCK_EMPLOYEES.length;

    data.push({
      label: `${year}년`,
      personalHours: parseFloat(personalHours.toFixed(1)),
      teamAverageHours: parseFloat(teamAverageHours.toFixed(1)),
      totalTeamHours: parseFloat(totalTeamHours.toFixed(1)),
      oecdAvg: OECD_YEARLY.avg,
      oecdMin: OECD_YEARLY.min,
      oecdMax: OECD_YEARLY.max
    });
  }
  return data;
};
