
export interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  checkIn: number; // timestamp
  checkOut?: number; // timestamp
  duration?: number; // minutes
  date: string; // YYYY-MM-DD
}

export interface WorkTimeData {
  label: string;
  personalHours: number;
  teamAverageHours: number;
  totalTeamHours: number;
  oecdAvg: number;
  oecdMin: number;
  oecdMax: number;
}

export interface AIInsight {
  summary: string;
  efficiencyScore: number;
  recommendations: string[];
}
