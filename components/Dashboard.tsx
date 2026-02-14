
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ReferenceLine, ComposedChart, Label
} from 'recharts';
import { Employee, AttendanceRecord, WorkTimeData, AIInsight } from '../types';
import { calculatePersonalDailyData, calculateMonthlyData, calculateYearlyData, getAttendanceRecords } from '../services/dataService';
import { getWorkInsights } from '../services/geminiService';
import { STORAGE_KEY_ATTENDANCE, MOCK_EMPLOYEES } from '../constants';
import { Card } from './Card';
import { Button } from './Button';

interface DashboardProps {
  currentUser: Employee;
  records: AttendanceRecord[];
}

type ViewType = 'daily' | 'monthly' | 'yearly';

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, records }) => {
  const [view, setView] = useState<ViewType>('daily');
  const [chartData, setChartData] = useState<WorkTimeData[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    switch (view) {
      case 'daily':
        setChartData(calculatePersonalDailyData(currentUser.id));
        break;
      case 'monthly':
        setChartData(calculateMonthlyData(currentUser.id));
        break;
      case 'yearly':
        setChartData(calculateYearlyData(currentUser.id));
        break;
    }
  }, [view, currentUser, records]);

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await getWorkInsights(records);
      setAiInsight(insight);
    } catch (error) {
      console.error("AI Insight error:", error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleResetData = () => {
    if (confirm('모든 데이터를 초기화하고 더미 데이터를 다시 생성하시겠습니까?')) {
      localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
      window.location.reload();
    }
  };

  // Helper to format labels for OECD Reference Lines
  const getOecdLabel = (name: string, value: number) => {
    const formattedValue = value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${name} (${formattedValue}h)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">근무 시간 대시보드</h2>
          <p className="text-sm text-gray-500">개인 및 팀 전체의 근무 현황과 OECD 국가별 비교 데이터를 보여줍니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-xs py-1 px-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200" onClick={handleResetData}>
            데이터 리셋
          </Button>
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {(['daily', 'monthly', 'yearly'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === v 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'daily' ? '일간' : v === 'monthly' ? '월간' : '연간'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2" title={`${view === 'daily' ? '최근 7일' : view === 'monthly' ? '최근 6개월' : '연도별'} 근무 시간 분석 (시간)`}>
          <div className="h-[450px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {view === 'daily' ? (
                <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  
                  <Bar name="나의 근무시간" dataKey="personalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar name="팀 평균시간" dataKey="teamAverageHours" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={25} />
                  
                  {/* Benchmarks using ReferenceLine for persistent visibility */}
                  <ReferenceLine y={chartData[0]?.oecdMax} stroke="#ef4444" strokeDasharray="3 3">
                    <Label value={getOecdLabel('OECD 최고', chartData[0]?.oecdMax || 0)} position="right" fill="#ef4444" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                  <ReferenceLine y={chartData[0]?.oecdAvg} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2}>
                    <Label value={getOecdLabel('OECD 평균', chartData[0]?.oecdAvg || 0)} position="right" fill="#f59e0b" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                  <ReferenceLine y={chartData[0]?.oecdMin} stroke="#10b981" strokeDasharray="3 3">
                    <Label value={getOecdLabel('OECD 최저', chartData[0]?.oecdMin || 0)} position="right" fill="#10b981" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                </ComposedChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 80, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar name="나의 총 시간" dataKey="personalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar name="팀 평균 총 시간" dataKey="teamAverageHours" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  
                  {/* OECD Benchmarks */}
                  <ReferenceLine y={chartData[0]?.oecdMax} stroke="#ef4444" strokeDasharray="3 3">
                    <Label value={getOecdLabel('OECD 최고', chartData[0]?.oecdMax || 0)} position="right" fill="#ef4444" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                  <ReferenceLine y={chartData[0]?.oecdAvg} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2}>
                    <Label value={getOecdLabel('OECD 평균', chartData[0]?.oecdAvg || 0)} position="right" fill="#f59e0b" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                  <ReferenceLine y={chartData[0]?.oecdMin} stroke="#10b981" strokeDasharray="3 3">
                    <Label value={getOecdLabel('OECD 최저', chartData[0]?.oecdMin || 0)} position="right" fill="#10b981" fontSize={10} fontWeight="bold" />
                  </ReferenceLine>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stats Column */}
        <div className="space-y-6">
          <Card title="현재 팀 요약" className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-blue-200">
            <div className="space-y-6">
              <div>
                <p className="text-blue-100 text-sm">오늘 전체 근무 시간</p>
                <h4 className="text-4xl font-bold mt-1">
                  {chartData.length > 0 ? chartData[chartData.length - 1].totalTeamHours : 0} <span className="text-xl font-normal">시간</span>
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">참여 인원</p>
                  <p className="text-xl font-bold mt-1">{MOCK_EMPLOYEES.length}명</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">평균 근무</p>
                  <p className="text-xl font-bold mt-1">
                    {chartData.length > 0 ? chartData[chartData.length - 1].teamAverageHours : 0}h
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-blue-200 text-xs font-medium">OECD 평균 대비 (일일 기준)</p>
                <p className="text-sm font-semibold">
                  {chartData.length > 0 && chartData[chartData.length - 1].teamAverageHours > 6.7 
                    ? `평균보다 ${(chartData[chartData.length - 1].teamAverageHours - 6.7).toFixed(1)}시간 더 근로 중`
                    : `평균보다 ${(6.7 - (chartData[chartData.length - 1]?.teamAverageHours || 0)).toFixed(1)}시간 적게 근로 중`}
                </p>
              </div>
            </div>
          </Card>

          <Card title="AI 인사이트 (대표용)" headerAction={
            <Button variant="outline" className="text-xs py-1 px-2 border-gray-300 text-gray-600 hover:bg-gray-50" onClick={generateAIInsight} disabled={isLoadingInsight}>
              {isLoadingInsight ? '분석 중...' : '분석하기'}
            </Button>
          }>
            {!aiInsight ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">데이터와 OECD 지표를 분석하여 인사이트를 확인하세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">팀 효율 지수</span>
                  <span className={`text-lg font-bold ${aiInsight.efficiencyScore > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                    {aiInsight.efficiencyScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${aiInsight.efficiencyScore}%` }}></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-blue-500 pl-3">
                  "{aiInsight.summary}"
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">권장 사항</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {aiInsight.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
