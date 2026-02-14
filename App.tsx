
import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord } from './types';
import { MOCK_EMPLOYEES, STORAGE_KEY_USER, STORAGE_KEY_ATTENDANCE } from './constants';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { TimeDisplay } from './components/TimeDisplay';
import { Dashboard } from './components/Dashboard';
import { getAttendanceRecords, saveAttendanceRecord } from './services/dataService';

const App: React.FC = () => {
  const [user, setUser] = useState<Employee | null>(null);
  const [empCode, setEmpCode] = useState('');
  const [error, setError] = useState('');
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAllRecords(getAttendanceRecords());
  }, []);

  useEffect(() => {
    if (user) {
      const records = getAttendanceRecords();
      const today = new Date().toISOString().split('T')[0];
      const activeRecord = records.find(r => r.employeeId === user.id && r.date === today && !r.checkOut);
      setCurrentRecord(activeRecord || null);
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_EMPLOYEES.find(e => e.id === empCode);
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(found));
      setError('');
    } else {
      setError('올바르지 않은 사원 코드입니다. (예: 1001, 2001)');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const handleCheckIn = () => {
    if (!user) return;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      checkIn: now,
      date: today
    };
    saveAttendanceRecord(newRecord);
    setCurrentRecord(newRecord);
    setAllRecords(getAttendanceRecords());
  };

  const handleCheckOut = () => {
    if (!currentRecord) return;
    const now = Date.now();
    const duration = Math.floor((now - currentRecord.checkIn) / 1000 / 60); // minutes
    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      checkOut: now,
      duration
    };
    saveAttendanceRecord(updatedRecord);
    setCurrentRecord(null);
    setAllRecords(getAttendanceRecords());
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">WorkSync Login</h1>
            <p className="text-gray-500">사원 코드를 입력하여 출근 시스템을 시작하세요.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사원 코드</label>
              <input 
                type="text" 
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="예: 1001"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <Button type="submit" fullWidth>로그인</Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">© 2024 WorkSync Systems. All rights reserved.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">W</div>
            <span className="text-xl font-bold text-gray-900">WorkSync</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name} ({user.role})</p>
              <p className="text-xs text-gray-500">{user.team} Team</p>
            </div>
            <Button variant="secondary" onClick={handleLogout} className="py-1 px-3 text-sm">로그아웃</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Quick Action Panel */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <div className="flex flex-col items-center text-center space-y-4">
              <TimeDisplay />
              <div className="w-full pt-4 border-t border-gray-100">
                {currentRecord ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      출근 시간: {new Date(currentRecord.checkIn).toLocaleTimeString()}
                    </div>
                    <Button variant="danger" fullWidth onClick={handleCheckOut}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      퇴근하기
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" fullWidth onClick={handleCheckIn}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    출근하기
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">인사말</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              안녕하세요, <strong>{user.name}</strong>님! 오늘도 활기찬 하루 되시기 바랍니다. 
              회사 전체의 근무 현황을 확인하려면 아래의 대시보드를 참고해 주세요. 
              {user.role === 'CEO' && " 대표님, 현재 회사의 전체 가동률과 직원들의 평균 근무 시간을 실시간으로 집계하고 있습니다."}
            </p>
          </Card>
        </section>

        {/* Dashboard Section */}
        <section>
          <Dashboard currentUser={user} records={allRecords} />
        </section>
      </main>
    </div>
  );
};

export default App;
