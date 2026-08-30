'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Users, User, Heart } from 'lucide-react';

interface StudentGenderChartProps {
  boysCount?: number;
  girlsCount?: number;
  title?: string;
}

export function StudentGenderChart({
  boysCount = 309,
  girlsCount = 215,
  title = "Élèves",
}: StudentGenderChartProps) {
  const totalStudents = boysCount + girlsCount;
  
  const boysPercentage = totalStudents > 0 
    ? Math.round((boysCount / totalStudents) * 100) 
    : 0;
  
  const girlsPercentage = totalStudents > 0 
    ? Math.round((girlsCount / totalStudents) * 100) 
    : 0;

  const data = [
    { name: 'Garçons', value: boysCount, color: '#007791' },
    { name: 'Filles', value: girlsCount, color: '#FF6B6B' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          {/* Subtitle hidden on mobile to save vertical space */}
          <p className="hidden sm:block text-sm font-semibold text-gray-600 mt-1">
            Elèves inscrits
          </p>
        </div>
        
      </div>

      {/* Summary KPI Cards - HIDDEN ON MOBILE (hidden sm:grid) */}
      <div className="hidden sm:grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        
        {/* Total */}
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-800 font-bold mb-2">Total</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none">{totalStudents}</p>
          {/* Spacer updated to match the new badge height */}
          <span className="text-xs px-2 py-0.5 mt-2 text-transparent select-none">0%</span> 
        </div>
        
        {/* Boys */}
        <div className="p-3 bg-[#007791] bg-opacity-5 rounded-md border border-[#007791]/30 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            
            <p className="text-sm text-gray-900 font-bold">Garçons</p>
          </div>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none">{boysCount}</p>
          {/* Converted percentage to a high-contrast badge */}
          <span className="text-xs font-black text-white bg-[#007791] px-2 py-0.5 rounded-full mt-2 shadow-sm">
            {boysPercentage}%
          </span>
        </div>
        
        {/* Girls */}
        <div className="p-3 bg-[#FF6B6B] bg-opacity-5 rounded-md border border-[#FF6B6B]/30 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            
            <p className="text-sm text-gray-900 font-bold">Filles</p>
          </div>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none">{girlsCount}</p>
          {/* Converted percentage to a high-contrast badge */}
          <span className="text-xs font-black text-white bg-[#FF6B6B] px-2 py-0.5 rounded-full mt-2 shadow-sm">
            {girlsPercentage}%
          </span>
        </div>

      </div>

      {/* Donut Chart */}
      <div className="h-52 sm:h-64 w-full relative mt-4 sm:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              // Changed to percentages so it shrinks/grows safely
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a202c',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: unknown) => [`${value} Élèves`, 'Effectif']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-900 font-bold">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{totalStudents}</span>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-gray-500">Élèves</span>
        </div>
      </div>
    </div>
  );
}