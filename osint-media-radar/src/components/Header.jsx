import React from 'react';
import { Radar, BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-radar-800/30 bg-[#0f1729]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-radar-500 to-radar-700 flex items-center justify-center">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1729] animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              OSINT Media Radar
            </h1>
            <p className="text-xs text-gray-500">
              Мониторинг и анализ информационного фона
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://osintframework.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-radar-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            OSINT Framework
          </a>
          <a
            href="https://cipher387.github.io/osint_stuff_tool_collection/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-radar-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            cipher387
          </a>
          <a
            href="https://ruosint.guru/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-radar-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            RuOSINT
          </a>
        </div>
      </div>
    </header>
  );
}
