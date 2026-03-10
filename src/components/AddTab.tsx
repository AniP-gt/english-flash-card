import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import type { AddCardResult } from '../hooks/useFlashCards';

type AddTabProps = {
  onAddCard: (payload: { word: string; meaning: string; example: string }) => AddCardResult;
};

const AddTab = ({ onAddCard }: AddTabProps) => {
  const [newCard, setNewCard] = useState({ word: '', meaning: '', example: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onAddCard(newCard);
    if (result === 'added') {
      setNewCard({ word: '', meaning: '', example: '' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Plus className="text-indigo-600" /> 単語を追加
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">英単語 *</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={newCard.word}
            onChange={(event) => setNewCard((prev) => ({ ...prev, word: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">意味 *</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={newCard.meaning}
            onChange={(event) => setNewCard((prev) => ({ ...prev, meaning: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">例文</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
            value={newCard.example}
            onChange={(event) => setNewCard((prev) => ({ ...prev, example: event.target.value }))}
          />
        </div>
        <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md active:scale-95">
          保存
        </button>
      </form>
    </div>
  );
};

export default AddTab;
