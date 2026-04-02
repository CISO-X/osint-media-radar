import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const LABELS = {
  positive: 'Позитив',
  neutral: 'Нейтрал',
  negative: 'Негатив',
};

export default function SentimentChart({ stats }) {
  if (!stats) return null;

  const total = stats.positive + stats.neutral + stats.negative;
  if (total === 0) return null;

  const data = [
    { name: 'Позитив', value: stats.positive, key: 'positive' },
    { name: 'Нейтрал', value: stats.neutral, key: 'neutral' },
    { name: 'Негатив', value: stats.negative, key: 'negative' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-[#141e30] rounded-2xl p-6 border border-radar-800/30">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-radar-500" />
        Анализ тональности
      </h3>

      <div className="flex items-center gap-6">
        <div className="w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#1a2332] border border-radar-800/50 rounded-lg p-2 shadow-xl text-sm">
                      {d.name}: {d.value} ({Math.round(d.value / total * 100)}%)
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {[
            { key: 'positive', icon: '+', label: 'Позитив' },
            { key: 'neutral', icon: '~', label: 'Нейтрал' },
            { key: 'negative', icon: '-', label: 'Негатив' },
          ].map(({ key, icon, label }) => {
            const val = stats[key];
            const pct = Math.round(val / total * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: COLORS[key] + '22', color: COLORS[key] }}
                >
                  {icon}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white font-medium">{val} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: COLORS[key] }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
