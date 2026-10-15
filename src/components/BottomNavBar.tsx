import React from 'react';
import { Home, Search, Settings } from 'lucide-react';

export type MainTabType = 'home' | 'search' | 'settings';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as MainTabType, label: 'Home', icon: Home },
    { id: 'search' as MainTabType, label: 'Search', icon: Search },
    { id: 'settings' as MainTabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-400 font-semibold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-400/50" />
                )}
              </div>
              <span className="text-[11px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
