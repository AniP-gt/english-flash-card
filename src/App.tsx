import { useEffect, useState } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import StudyTab from './components/StudyTab';
import ListTab from './components/ListTab';
import AddTab from './components/AddTab';
import SettingsTab from './components/SettingsTab';
import { useFlashCards, type AddCardResult } from './hooks/useFlashCards';
import { useSpeech } from './hooks/useSpeech';
import type { AppTab } from './types';
import { THEME_KEY } from './constants';

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('study');
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const {
    cards,
    currentIndex,
    isFlipped,
    setIsFlipped,
    searchTerm,
    setSearchTerm,
    listFilter,
    setListFilter,
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
    handleNext,
    handlePrev,
    shuffleCards,
  } = useFlashCards();

  const { voices, selectedVoiceURI, setSelectedVoiceURI, speak } = useSpeech();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsMounted(true);
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;
    window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode, isMounted]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleAddCard = (payload: { word: string; meaning: string; example: string }): AddCardResult => {
    const result = addCard(payload);
    if (result !== 'invalid') {
      setActiveTab('list');
    }
    if (result === 'duplicate') {
      setSearchTerm(payload.word);
    }
    return result;
  };

  if (!isMounted) return null;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-300">
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setActiveTab={setActiveTab}
          exportCSV={exportCSV}
          importCSV={importCSV}
        />

        <main className="max-w-xl mx-auto px-4 py-8">
          {activeTab === 'study' && (
            <StudyTab
              cards={cards}
              currentIndex={currentIndex}
              isFlipped={isFlipped}
              handleNext={handleNext}
              handlePrev={handlePrev}
              setIsFlipped={setIsFlipped}
              toggleLearned={toggleLearned}
              speak={speak}
              shuffleCards={shuffleCards}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'list' && (
            <ListTab
              filteredCards={filteredCards}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              listFilter={listFilter}
              setListFilter={setListFilter}
              editingId={editingId}
              editValues={editValues}
              setEditValues={setEditValues}
              startEditing={startEditing}
              saveEdit={saveEdit}
              cancelEditing={() => setEditingId(null)}
              deleteCard={deleteCard}
              toggleLearned={toggleLearned}
              speak={speak}
            />
          )}

          {activeTab === 'add' && <AddTab onAddCard={handleAddCard} />}

          {activeTab === 'settings' && (
            <SettingsTab
              voices={voices}
              selectedVoiceURI={selectedVoiceURI}
              setSelectedVoiceURI={setSelectedVoiceURI}
              speak={speak}
              setActiveTab={setActiveTab}
            />
          )}
        </main>

        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
