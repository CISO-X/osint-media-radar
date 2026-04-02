import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Database, Users, Globe, Shield } from 'lucide-react';

const LINKS = [
  {
    category: 'Проверка компаний (РФ)',
    icon: <Database className="w-4 h-4" />,
    items: [
      { name: 'ЕГРЮЛ / ФНС', url: 'https://egrul.nalog.ru', desc: 'Реестр юридических лиц' },
      { name: 'Rusprofile', url: 'https://www.rusprofile.ru', desc: 'Профили компаний' },
      { name: 'Контур.Фокус', url: 'https://focus.kontur.ru', desc: 'Проверка контрагентов' },
      { name: 'Картотека арбитражных дел', url: 'https://kad.arbitr.ru', desc: 'Судебные дела' },
      { name: 'Реестр банкротств', url: 'https://bankrot.fedresurs.ru', desc: 'Сведения о банкротстве' },
      { name: 'Реестр залогов', url: 'https://www.reestr-zalogov.ru', desc: 'Залоги движимого имущества' },
    ]
  },
  {
    category: 'Поиск по персонам',
    icon: <Users className="w-4 h-4" />,
    items: [
      { name: 'Maigret', url: 'https://github.com/soxoj/maigret', desc: 'Поиск по юзернейму на 3000+ сайтах' },
      { name: 'Social Links', url: 'https://sociallinks.io', desc: 'OSINT-платформа' },
      { name: 'OWASP Social OSINT Agent', url: 'https://owasp.org/www-project-social-osint-agent/', desc: 'ИИ-агент для соцсетей' },
      { name: 'Судебные решения', url: 'https://sudact.ru', desc: 'База судебных решений' },
    ]
  },
  {
    category: 'Каталоги OSINT-инструментов',
    icon: <Globe className="w-4 h-4" />,
    items: [
      { name: 'cipher387 Collection', url: 'https://cipher387.github.io/osint_stuff_tool_collection/', desc: '1000+ инструментов' },
      { name: 'RuOSINT.guru', url: 'https://ruosint.guru/', desc: 'Каталог инструментов (РФ)' },
      { name: 'OSINT Framework', url: 'https://osintframework.com', desc: 'Фреймворк OSINT' },
      { name: 'OSINT.Link', url: 'https://osint.link', desc: 'Каталог ресурсов' },
    ]
  },
  {
    category: 'ИИ-агенты для OSINT',
    icon: <Shield className="w-4 h-4" />,
    items: [
      { name: 'AI Deep Research Agent', url: 'https://github.com/Shubhamsaboo/awesome-llm-apps', desc: 'Глубокий ресёрч с ИИ' },
      { name: 'AI Journalist Agent', url: 'https://github.com/Shubhamsaboo/awesome-llm-apps', desc: 'Сбор и анализ новостей' },
      { name: 'AI Competitor Intelligence', url: 'https://github.com/Shubhamsaboo/awesome-llm-apps', desc: 'Конкурентная разведка' },
      { name: 'OWASP Agentic Top 10', url: 'https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/', desc: 'Безопасность ИИ-агентов' },
    ]
  },
];

export default function OsintLinks() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#141e30] rounded-2xl p-6 border border-radar-800/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-lg font-semibold text-white"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-radar-500" />
          Каталог OSINT-ресурсов
        </span>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {LINKS.map((group) => (
            <div key={group.category} className="bg-[#1a2332] rounded-xl p-4 border border-radar-800/20">
              <h4 className="text-sm font-medium text-radar-400 mb-3 flex items-center gap-2">
                {group.icon}
                {group.category}
              </h4>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group py-1"
                  >
                    <div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                      <span className="text-xs text-gray-600 ml-2">{item.desc}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-radar-400 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
