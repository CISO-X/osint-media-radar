import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Timeline({ data }) {
  if (!data || data.length === 0) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#1a2332] border border-radar-800/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-300 mb-1">{formatDate(label)}</p>
        <p className="text-sm text-green-400">Позитив: {payload[0]?.value || 0}</p>
        <p className="text-sm text-gray-400">Нейтрал: {payload[1]?.value || 0}</p>
        <p className="text-sm text-red-400">Негатив: {payload[2]?.value || 0}</p>
      </div>
    );
  };

  return (
    <div className="bg-[#141e30] rounded-2xl p-6 border border-radar-800/30">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-radar-500" />
        Таймлайн упоминаний
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="url(#gradPositive)" strokeWidth={2} />
          <Area type="monotone" dataKey="neutral" stroke="#6b7280" fill="url(#gradNeutral)" strokeWidth={2} />
          <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#gradNegative)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
