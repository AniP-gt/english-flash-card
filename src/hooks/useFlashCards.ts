import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FlashCard, ListFilter, StudyMode } from '../types';
import { STORAGE_KEY } from '../constants';

type EditValues = {
  word: string;
  meaning: string;
  example: string;
};

export type AddCardResult = 'added' | 'duplicate' | 'invalid';

type AddCardInput = {
  word: string;
  meaning: string;
  example: string;
};

export const useFlashCards = () => {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({ word: '', meaning: '', example: '' });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsHydrated(true);
    const savedCards = window.localStorage.getItem(STORAGE_KEY);
    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, isHydrated]);

  const addCard = useCallback((payload: AddCardInput): AddCardResult => {
    const trimmedWord = payload.word.trim();
    const trimmedMeaning = payload.meaning.trim();
    if (!trimmedWord || !trimmedMeaning) return 'invalid';
    const exists = cards.some((card) => card.word.toLowerCase() === trimmedWord.toLowerCase());
    if (exists) return 'duplicate';

    const card: FlashCard = {
      id: crypto.randomUUID(),
      word: trimmedWord,
      meaning: trimmedMeaning,
      example: payload.example.trim(),
      isLearned: false,
      createdAt: Date.now(),
    };
    setCards((prev) => [card, ...prev]);
    return 'added';
  }, [cards]);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const toggleLearned = useCallback((id: string) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, isLearned: !card.isLearned } : card)));
    setIsFlipped(false);
  }, []);

  const startEditing = useCallback((card: FlashCard) => {
    setEditingId(card.id);
    setEditValues({ word: card.word, meaning: card.meaning, example: card.example });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    setCards((prev) => prev.map((card) => (card.id === editingId ? { ...card, ...editValues } : card)));
    setEditingId(null);
  }, [editValues, editingId]);

  const studyCards = useMemo(() => {
    if (studyMode === 'skip-learned') return cards.filter((card) => !card.isLearned);
    if (studyMode === 'learned-only') return cards.filter((card) => card.isLearned);
    return cards;
  }, [cards, studyMode]);

  const handleNext = useCallback(() => {
    if (studyCards.length === 0) return;
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % studyCards.length);
      }, 150);
    } else {
      setCurrentIndex((prev) => (prev + 1) % studyCards.length);
    }
  }, [studyCards.length, isFlipped]);

  const handlePrev = useCallback(() => {
    if (studyCards.length === 0) return;
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + studyCards.length) % studyCards.length);
      }, 150);
    } else {
      setCurrentIndex((prev) => (prev - 1 + studyCards.length) % studyCards.length);
    }
  }, [studyCards.length, isFlipped]);

  const shuffleCards = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
    }, 50);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = 'word,meaning,example,isLearned\n';
    const rows = cards
      .map((card) => {
        const safeWord = card.word.replace(/"/g, '""');
        const safeMeaning = card.meaning.replace(/"/g, '""');
        const safeExample = card.example.replace(/"/g, '""');
        return `"${safeWord}","${safeMeaning}","${safeExample}",${card.isLearned}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `flashcards_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }, [cards]);

  const importCSV = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const startIdx = lines[0].toLowerCase().includes('word') ? 1 : 0;
      const existingWords = new Set(cards.map((card) => card.word.toLowerCase()));
      const newImportedCards = lines
        .slice(startIdx)
        .map((line) => {
          const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
          const parts = line.match(regex) || line.split(',');
          const word = (parts[0] || '').trim().replace(/^"|"$/g, '');
          const meaning = (parts[1] || '').trim().replace(/^"|"$/g, '');
          const example = (parts[2] || '').trim().replace(/^"|"$/g, '');
          const isLearned = (parts[3] || '').trim().toLowerCase() === 'true';
          return { word, meaning, example, isLearned };
        })
        .filter((item) => item.word && item.meaning && !existingWords.has(item.word.toLowerCase()))
        .map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        }));

      if (newImportedCards.length > 0) {
        setCards((prev) => [...newImportedCards, ...prev]);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        listFilter === 'all' ? true : listFilter === 'learned' ? card.isLearned : !card.isLearned;
      return matchesSearch && matchesFilter;
    });
  }, [cards, listFilter, searchTerm]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [studyMode]);

  useEffect(() => {
    if (studyCards.length > 0 && currentIndex >= studyCards.length) {
      setCurrentIndex(studyCards.length - 1);
    }
  }, [studyCards.length, currentIndex]);

  return {
    cards,
    currentIndex,
    setCurrentIndex,
    isFlipped,
    setIsFlipped,
    searchTerm,
    setSearchTerm,
    listFilter,
    setListFilter,
    studyMode,
    setStudyMode,
    editingId,
    editValues,
    setEditValues,
    setEditingId,
    addCard,
    deleteCard,
    toggleLearned,
    startEditing,
    saveEdit,
    exportCSV,
    importCSV,
    filteredCards,
    studyCards,
    handleNext,
    handlePrev,
    shuffleCards,
  };
};
