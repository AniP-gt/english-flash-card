import type { Dispatch, SetStateAction } from 'react';
import { Search, X } from 'lucide-react';
import type { FlashCard as FlashCardType, ListFilter } from '../types';
import CardItem from './CardItem';

type ListTabProps = {
  filteredCards: FlashCardType[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  listFilter: ListFilter;
  setListFilter: Dispatch<SetStateAction<ListFilter>>;
  editingId: string | null;
  editValues: {
    word: string;
    meaning: string;
    example: string;
  };
  setEditValues: Dispatch<SetStateAction<{ word: string; meaning: string; example: string }>>;
  startEditing: (card: FlashCardType) => void;
  saveEdit: () => void;
  cancelEditing: () => void;
  deleteCard: (id: string) => void;
  toggleLearned: (id: string) => void;
  speak: (value: string) => void;
};

const ListTab = ({
  filteredCards,
  searchTerm,
  setSearchTerm,
  listFilter,
  setListFilter,
  editingId,
  editValues,
  setEditValues,
  startEditing,
  saveEdit,
  cancelEditing,
  deleteCard,
  toggleLearned,
  speak,
}: ListTabProps) => {
  const filterOptions: ListFilter[] = ['all', 'unlearned', 'learned'];

  const getLabel = (filter: ListFilter) => {
    switch (filter) {
      case 'all':
        return 'すべて';
      case 'learned':
        return '覚えた';
      case 'unlearned':
        return '未学習';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="検索..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setListFilter(filter)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                listFilter === filter
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500'
              }`}
            >
              {getLabel(filter)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filteredCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            isEditing={editingId === card.id}
            editValues={editValues}
            setEditValues={setEditValues}
            onSave={saveEdit}
            onCancel={cancelEditing}
            onStartEditing={() => startEditing(card)}
            onDelete={() => deleteCard(card.id)}
            onToggleLearned={() => toggleLearned(card.id)}
            onSpeak={speak}
          />
        ))}
      </div>
    </div>
  );
};

export default ListTab;
