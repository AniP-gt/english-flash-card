import type { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import type { FlashCard as FlashCardType, AppTab } from '../types';
import FlashCard from './FlashCard';

type StudyTabProps = {
  cards: FlashCardType[];
  currentIndex: number;
  isFlipped: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  setIsFlipped: Dispatch<SetStateAction<boolean>>;
  toggleLearned: (id: string) => void;
  speak: (value: string) => void;
  shuffleCards: () => void;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
};

const StudyTab = ({
  cards,
  currentIndex,
  isFlipped,
  handleNext,
  handlePrev,
  setIsFlipped,
  toggleLearned,
  speak,
  shuffleCards,
  setActiveTab,
}: StudyTabProps) => {
  const hasCards = cards.length > 0;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
          `,
        }}
      />
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {hasCards ? (
          <>
            <div className="flex justify-between items-center mb-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span>
                  Card {currentIndex + 1} of {cards.length}
                </span>
                {cards[currentIndex].isLearned && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs">
                    <CheckCircle2 size={12} /> 覚えた
                  </span>
                )}
              </div>
              <button onClick={shuffleCards} className="flex items-center gap-1 hover:text-indigo-600">
                <RotateCw size={14} /> シャッフル
              </button>
            </div>

            <FlashCard
              card={cards[currentIndex]}
              isFlipped={isFlipped}
              onToggleFlip={() => setIsFlipped((prev) => !prev)}
              speak={speak}
              toggleLearned={toggleLearned}
            />

            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700 border shadow-sm rounded-full hover:bg-slate-50 active:scale-95 transition"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="px-10 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition"
              >
                Flip
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700 border shadow-sm rounded-full hover:bg-slate-50 active:scale-95 transition"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500">カードがありません</p>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              単語を追加する
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StudyTab;
