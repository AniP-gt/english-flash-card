import { Check, Settings } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { AppTab } from '../types';

type SettingsTabProps = {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  setSelectedVoiceURI: Dispatch<SetStateAction<string>>;
  speak: (value: string) => void;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
  clearCache: () => void;
};

const SettingsTab = ({ voices, selectedVoiceURI, setSelectedVoiceURI, speak, setActiveTab, clearCache }: SettingsTabProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border dark:border-slate-700 animate-in fade-in duration-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-indigo-600" /> 音声設定
      </h2>
      <div className="space-y-4">
        <div className="max-h-80 overflow-y-auto border dark:border-slate-700 rounded-xl divide-y dark:divide-slate-700 bg-slate-50 dark:bg-slate-900/50">
          {voices.map((voice) => (
            <button
              key={voice.voiceURI}
              type="button"
              onClick={() => setSelectedVoiceURI(voice.voiceURI)}
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                selectedVoiceURI === voice.voiceURI ? 'bg-indigo-50 dark:bg-indigo-900/30 font-bold text-indigo-600 dark:text-indigo-400' : ''
              }`}
            >
              <div className="flex flex-col">
                <span>{voice.name}</span>
                <span className="text-xs text-slate-400">{voice.lang}</span>
              </div>
              {selectedVoiceURI === voice.voiceURI && <Check size={18} />}
            </button>
          ))}
        </div>
          <button
            type="button"
            onClick={() => speak('Voice test complete.')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
          >
            テスト再生
          </button>
          <button
            type="button"
            onClick={clearCache}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-600 border border-red-200 dark:border-red-500/50 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            単語キャッシュを完全にクリア
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('study')}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mt-4 shadow-md active:scale-95 transition"
          >
          完了
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
