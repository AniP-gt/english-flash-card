import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { BookOpen, FileDown, FileUp, Moon, Settings, Sun } from 'lucide-react';
import type { AppTab } from '../types';

type HeaderProps = {
  activeTab: AppTab;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
  exportCSV: () => void;
  importCSV: (event: ChangeEvent<HTMLInputElement>) => void;
};

const Header = ({
  activeTab,
  darkMode,
  toggleDarkMode,
  setActiveTab,
  exportCSV,
  importCSV,
}: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-20 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400 cursor-pointer"
          onClick={() => setActiveTab('study')}
        >
          <BookOpen size={24} />
          <span className="hidden xs:inline">EngCards</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <FileDown size={18} />
            <span className="hidden md:inline">エクスポート</span>
          </button>

          <label className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">
            <FileUp size={18} />
            <span className="hidden md:inline">インポート</span>
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
          </label>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-full transition ${
              activeTab === 'settings'
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
