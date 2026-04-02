import React from 'react';
import { AlertTriangle, Shield, TrendingUp, FileText, BarChart3 } from 'lucide-react';

const FLAG_STYLES = {
  critical: { bg: 'bg-red-500/15', border: 'border-red-500/40', icon: 'text-red-400' },
  high: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', icon: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', icon: 'text-yellow-400' },
};

export default function Summary({ summary, isDemo }) {
  if (!summary) return null;

  return (
    <div className="bg-[#141e30] rounded-2xl p-6 border border-radar-800/30">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-radar-500" />
        Executive Summary
        {isDemo && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md">
            ДЕМО
          </span>
        )}
      </h3>

      {/* Main text */}
      <div className="bg-[#1a2332] rounded-xl p-4 mb-4 border border-radar-800/20">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-radar-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300 leading-relaxed">{summary.text}</p>
        </div>
      </div>

      {/* Stats row */}
      {summary.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox
            icon={<BarChart3 className="w-4 h-4" />}
            label="Публикаций"
            value={summary.stats.total}
            color="text-radar-400"
          />
          <StatBox
            icon={<TrendingUp className="w-4 h-4" />}
            label="Источников"
            value={summary.stats.sources}
            color="text-blue-400"
          />
          <StatBox
            icon={<Shield className="w-4 h-4" />}
            label="Тренд"
            value={summary.stats.trend}
            color="text-emerald-400"
            isText
          />
          <StatBox
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Сигналов"
            value={summary.redFlags?.length || 0}
            color={summary.redFlags?.length > 0 ? 'text-red-400' : 'text-green-400'}
          />
        </div>
      )}

      {/* Red flags */}
      {summary.redFlags && summary.redFlags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Сигналы, требующие проверки
          </h4>
          {summary.redFlags.map((flag, i) => {
            const style = FLAG_STYLES[flag.level] || FLAG_STYLES.medium;
            return (
              <div
                key={i}
                className={`${style.bg} border ${style.border} rounded-lg px-4 py-2.5 flex items-start gap-2`}
              >
                <AlertTriangle className={`w-4 h-4 ${style.icon} flex-shrink-0 mt-0.5`} />
                <span className="text-sm text-gray-300">{flag.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* No red flags */}
      {(!summary.redFlags || summary.redFlags.length === 0) && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Критических сигналов не обнаружено</span>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color, isText = false }) {
  return (
    <div className="bg-[#1a2332] rounded-xl p-3 border border-radar-800/20 text-center">
      <div className={`flex items-center justify-center gap-1.5 ${color} mb-1`}>
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`${isText ? 'text-xs' : 'text-xl'} font-bold text-white`}>
        {value}
      </div>
    </div>
  );
}
