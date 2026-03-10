import type { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Circle, Edit2, Save, Trash2, Volume2 } from 'lucide-react';
import type { FlashCard as FlashCardType } from '../types';

type CardItemProps = {
  card: FlashCardType;
  isEditing: boolean;
  editValues: {
    word: string;
    meaning: string;
    example: string;
  };
  setEditValues: Dispatch<SetStateAction<{ word: string; meaning: string; example: string }>>;
  onSave: () => void;
  onCancel: () => void;
  onStartEditing: () => void;
  onDelete: () => void;
  onToggleLearned: () => void;
  onSpeak: (value: string) => void;
};

const CardItem = ({
  card,
  isEditing,
  editValues,
  setEditValues,
  onSave,
  onCancel,
  onStartEditing,
  onDelete,
  onToggleLearned,
  onSpeak,
}: CardItemProps) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border-2 transition group shadow-sm ${
        isEditing ? 'border-indigo-500' : card.isLearned ? 'border-green-100 dark:border-green-900/50' : 'dark:border-slate-700'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg"
            value={editValues.word}
            onChange={(event) => setEditValues({ ...editValues, word: event.target.value })}
            placeholder="Word"
          />
          <input
            className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg"
            value={editValues.meaning}
            onChange={(event) => setEditValues({ ...editValues, meaning: event.target.value })}
            placeholder="Meaning"
          />
          <textarea
            className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg"
            value={editValues.example}
            onChange={(event) => setEditValues({ ...editValues, example: event.target.value })}
            placeholder="Example"
          />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSave}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
              >
                <Save size={16} /> 保存
              </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-200 dark:bg-slate-700 py-2 rounded-lg text-sm font-bold"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleLearned}
                className={`transition-colors ${card.isLearned ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
              >
                {card.isLearned ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <h4 className={`font-bold text-lg ${card.isLearned ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                {card.word}
              </h4>
              <button type="button" onClick={() => onSpeak(card.word)} className="text-slate-400 hover:text-indigo-600">
                <Volume2 size={16} />
              </button>
            </div>
            <p className={`${card.isLearned ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'} font-medium`}>{card.meaning}</p>
            {card.example && (
              <div className="mt-2 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 italic">
                <button type="button" onClick={() => onSpeak(card.example)} className="mt-1 flex-shrink-0 text-slate-400 hover:text-indigo-500">
                  <Volume2 size={14} />
                </button>
                <p>{card.example}</p>
              </div>
            )}
          </div>
          <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition">
            <button type="button" onClick={onStartEditing} className="p-2 text-slate-400 hover:text-indigo-500 transition">
              <Edit2 size={18} />
            </button>
            <button type="button" onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 transition">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardItem;
