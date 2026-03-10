import { CheckCircle2, Circle, Volume2 } from 'lucide-react';
import type { FlashCard as FlashCardType } from '../types';

type FlashCardProps = {
  card: FlashCardType;
  isFlipped: boolean;
  onToggleFlip: () => void;
  speak: (value: string) => void;
  toggleLearned: (id: string) => void;
};

const FlashCard = ({ card, isFlipped, onToggleFlip, speak, toggleLearned }: FlashCardProps) => {
  return (
    <div className="relative h-96 w-full cursor-pointer perspective-1000 group" onClick={onToggleFlip}>
      <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div
          className={`absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 backface-hidden flex flex-col items-center justify-center p-8 text-center transition-colors duration-300 z-10 ${
            card.isLearned ? 'border-green-500 dark:border-green-600 shadow-green-100 dark:shadow-none' : 'border-slate-100 dark:border-slate-700'
          }`}
        >
          <div className="animate-in fade-in duration-300">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 break-words w-full mb-4">{card.word}</h2>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                speak(card.word);
              }}
              className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:scale-110 transition active:scale-95 shadow-sm"
            >
              <Volume2 size={32} />
            </button>
          </div>
          <p className="absolute bottom-6 text-slate-400 text-sm italic">タップで答えを見る</p>
        </div>

        <div
          className={`absolute inset-0 rounded-3xl shadow-xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center overflow-y-auto ${
            card.isLearned ? 'bg-green-600 dark:bg-green-700' : 'bg-indigo-600 dark:bg-indigo-700'
          } text-white transition-colors duration-300`}
        >
          <div className={`transition-opacity duration-300 ${!isFlipped ? 'opacity-0' : 'opacity-100'}`}>
            <h3 className="text-3xl font-bold mb-6">{card.meaning}</h3>
            {card.example && (
              <div className="bg-white/10 p-5 rounded-2xl text-indigo-50 italic max-w-full relative mb-6">
                <p className="mb-2 text-lg">"{card.example}"</p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    speak(card.example);
                  }}
                  className="mx-auto flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition text-sm font-bold"
                >
                  <Volume2 size={16} /> 例文を聴く
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleLearned(card.id);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg mx-auto ${
                card.isLearned
                  ? 'bg-white text-green-700'
                  : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
              }`}
            >
              {card.isLearned ? (
                <>
                  <CheckCircle2 size={20} /> 覚えた！
                </>
              ) : (
                <>
                  <Circle size={20} /> 覚えたらチェック
                </>
              )}
            </button>
          </div>
          <p className="absolute bottom-6 text-white/60 text-sm">タップで戻す</p>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
