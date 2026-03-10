import type { Dispatch, MouseEventHandler, ReactNode, SetStateAction } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import type { AppTab } from '../types';

type NavBarProps = {
  activeTab: AppTab;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
};

type NavButtonProps = {
  active: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: ReactNode;
  label?: string;
  isPrimary?: boolean;
};

export const NavButton = ({ active, onClick, icon, label, isPrimary = false }: NavButtonProps) => {
  if (isPrimary) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center justify-center -mt-8 w-14 h-14 rounded-full shadow-lg transition transform active:scale-95 ${
          active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600'
        }`}
      >
        {icon}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-1 py-1 transition ${
        active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const NavBar = ({ activeTab, setActiveTab }: NavBarProps) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: '.safe-area-bottom { padding-bottom: calc(0.5rem + env(safe-area-inset-bottom)); }',
        }}
      />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t dark:border-slate-700 px-4 py-2 flex justify-around items-center z-30 safe-area-bottom">
        <NavButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<BookOpen size={20} />} label="学習" />
        <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<Search size={20} />} label="一覧" />
        <NavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<Plus size={24} />} label="追加" isPrimary />
      </nav>
    </>
  );
};

export default NavBar;
