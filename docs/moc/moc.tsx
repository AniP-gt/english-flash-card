import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Search,
  BookOpen,
  X,
  Sun,
  Moon,
  FileDown,
  FileUp,
  Settings,
  Check,
  Edit2,
  Save,
  CheckCircle2,
  Circle
} from 'lucide-react';

/**
 * Constants
 */
const STORAGE_KEY = 'flashcards-data-v3';
const THEME_KEY = 'flashcards-theme';
const SETTINGS_KEY = 'flashcards-settings';

const App = () => {
  // --- State ---
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCard, setNewCard] = useState({ word: '', meaning: '', example: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'list' | 'add' | 'settings'
  const [darkMode, setDarkMode] = useState(false);
  
  // Filtering in List
  const [listFilter, setListFilter] = useState('all'); // 'all' | 'unlearned' | 'learned'

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ word: '', meaning: '', example: '' });

  // Voice Settings
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  // --- Initial Load ---
  useEffect(() => {
    setIsMounted(true);
    const savedCards = localStorage.getItem(STORAGE_KEY);
    if (savedCards) {
      try { setCards(JSON.parse(savedCards)); } catch (e) { console.error(e); }
    }
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    else setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedVoiceURI(settings.voiceURI || '');
    }
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const enVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      setVoices(enVoices.length > 0 ? enVoices : availableVoices);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // --- Persistence ---
  useEffect(() => { if (isMounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); }, [cards, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light'); }, [darkMode, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem(SETTINGS_KEY, JSON.stringify({ voiceURI: selectedVoiceURI })); }, [selectedVoiceURI, isMounted]);

  // --- Speech Engine ---
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
    else utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [voices, selectedVoiceURI]);

  // --- Handlers ---
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addCard = (e) => {
    e.preventDefault();
    if (!newCard.word || !newCard.meaning) return;
    
    // Manual duplicate check for direct entry
    if (cards.some(c => c.word.toLowerCase() === newCard.word.toLowerCase())) {
      // In a real app we might show a toast, but for now we just don't add
      setActiveTab('list');
      setSearchTerm(newCard.word);
      return;
    }

    const card = { ...newCard, id: crypto.randomUUID(), createdAt: Date.now(), isLearned: false };
    setCards([card, ...cards]);
    setNewCard({ word: '', meaning: '', example: '' });
    setActiveTab('list');
  };

  const deleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const toggleLearned = (id) => {
    setCards(cards.map(c => c.id === id ? { ...c, isLearned: !c.isLearned } : c));
  };

  const startEditing = (card) => {
    setEditingId(card.id);
    setEditValues({ word: card.word, meaning: card.meaning, example: card.example });
  };

  const saveEdit = () => {
    setCards(cards.map(c => c.id === editingId ? { ...c, ...editValues } : c));
    setEditingId(null);
  };

  const handleNext = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
      }, 150);
    } else {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }
  };

  const handlePrev = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
      }, 150);
    } else {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  // --- CSV Logic ---
  const exportCSV = () => {
    const headers = "word,meaning,example,isLearned\n";
    const rows = cards.map(c => `"${c.word.replace(/"/g, '""')}","${c.meaning.replace(/"/g, '""')}","${c.example.replace(/"/g, '""')}",${c.isLearned}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `flashcards_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const startIdx = lines[0].toLowerCase().includes('word') ? 1 : 0;
      
      // Existing word set for fast lookup
      const existingWords = new Set(cards.map(c => c.word.toLowerCase()));
      
      const newImportedCards = lines.slice(startIdx).map(line => {
        // Handle CSV parsing for quotes/commas better
        const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
        const parts = line.match(regex) || line.split(',');
        
        const word = (parts[0] || '').trim().replace(/^"|"$/g, '');
        const meaning = (parts[1] || '').trim().replace(/^"|"$/g, '');
        const example = (parts[2] || '').trim().replace(/^"|"$/g, '');
        const isLearned = (parts[3] || '').trim().toLowerCase() === 'true';

        return { word, meaning, example, isLearned };
      }).filter(item => {
        // Valid if has word+meaning AND word doesn't already exist in the list
        return item.word && item.meaning && !existingWords.has(item.word.toLowerCase());
      }).map(item => ({
        ...item,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      }));

      if (newImportedCards.length > 0) {
        setCards(prev => [...newImportedCards, ...prev]);
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const matchesSearch = c.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = listFilter === 'all' ? true : 
                           listFilter === 'learned' ? c.isLearned : !c.isLearned;
      return matchesSearch && matchesFilter;
    });
  }, [cards, searchTerm, listFilter]);

  if (!isMounted) return null;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-300">
        
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => setActiveTab('study')}>
              <BookOpen size={24} />
              <span className="hidden xs:inline">EngCards</span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                <FileDown size={18} />
                <span className="hidden md:inline">エクスポート</span>
              </button>
              
              <label className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">
                <FileUp size={18} />
                <span className="hidden md:inline">インポート</span>
                <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
              </label>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setActiveTab('settings')} className={`p-2 rounded-full transition ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 py-8">
          
          {/* Study Mode */}
          {activeTab === 'study' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {cards.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <span>Card {currentIndex + 1} of {cards.length}</span>
                      {cards[currentIndex].isLearned && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs">
                          <CheckCircle2 size={12} /> 覚えた
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setIsFlipped(false); setTimeout(() => { setCards([...cards].sort(() => Math.random() - 0.5)); setCurrentIndex(0); }, 50); }} className="flex items-center gap-1 hover:text-indigo-600">
                      <RotateCw size={14} /> シャッフル
                    </button>
                  </div>

                  <div className="relative h-96 w-full cursor-pointer perspective-1000 group" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                      
                      {/* Front Side */}
                      <div className={`absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 backface-hidden flex flex-col items-center justify-center p-8 text-center transition-colors duration-300 z-10 ${cards[currentIndex].isLearned ? 'border-green-500 dark:border-green-600 shadow-green-100 dark:shadow-none' : 'border-slate-100 dark:border-slate-700'}`}>
                        <div key={cards[currentIndex].id} className="animate-in fade-in duration-300">
                          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 break-words w-full mb-4">
                            {cards[currentIndex].word}
                          </h2>
                          <button onClick={(e) => { e.stopPropagation(); speak(cards[currentIndex].word); }} className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:scale-110 transition active:scale-95 shadow-sm">
                            <Volume2 size={32} />
                          </button>
                        </div>
                        <p className="absolute bottom-6 text-slate-400 text-sm italic">タップで答えを見る</p>
                      </div>

                      {/* Back Side */}
                      <div className={`absolute inset-0 rounded-3xl shadow-xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center overflow-y-auto ${cards[currentIndex].isLearned ? 'bg-green-600 dark:bg-green-700' : 'bg-indigo-600 dark:bg-indigo-700'} text-white transition-colors duration-300`}>
                        <div className={`transition-opacity duration-300 ${!isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                          <h3 className="text-3xl font-bold mb-6">{cards[currentIndex].meaning}</h3>
                          {cards[currentIndex].example && (
                            <div className="bg-white/10 p-5 rounded-2xl text-indigo-50 italic max-w-full relative mb-6">
                              <p className="mb-2 text-lg">"{cards[currentIndex].example}"</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); speak(cards[currentIndex].example); }}
                                className="mx-auto flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition text-sm font-bold"
                              >
                                <Volume2 size={16} /> 例文を聴く
                              </button>
                            </div>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLearned(cards[currentIndex].id); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg mx-auto ${cards[currentIndex].isLearned ? 'bg-white text-green-700' : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'}`}
                          >
                            {cards[currentIndex].isLearned ? <><CheckCircle2 size={20} /> 覚えた！</> : <><Circle size={20} /> 覚えたらチェック</>}
                          </button>
                        </div>
                        <p className="absolute bottom-6 text-white/60 text-sm">タップで戻す</p>
                      </div>

                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-8">
                    <button onClick={handlePrev} className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700 border shadow-sm rounded-full hover:bg-slate-50 active:scale-95 transition">
                      <ChevronLeft size={28} />
                    </button>
                    <button onClick={() => setIsFlipped(!isFlipped)} className="px-10 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition">
                      Flip
                    </button>
                    <button onClick={handleNext} className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700 border shadow-sm rounded-full hover:bg-slate-50 active:scale-95 transition">
                      <ChevronRight size={28} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-slate-500">カードがありません</p>
                  <button onClick={() => setActiveTab('add')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">単語を追加する</button>
                </div>
              )}
            </div>
          )}

          {/* List Mode */}
          {activeTab === 'list' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="検索..." className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}
                </div>
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  {['all', 'unlearned', 'learned'].map(f => (
                    <button key={f} onClick={() => setListFilter(f)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${listFilter === f ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{f === 'all' ? 'すべて' : f === 'learned' ? '覚えた' : '未学習'}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredCards.map(card => (
                  <div key={card.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border-2 transition group shadow-sm ${editingId === card.id ? 'border-indigo-500' : card.isLearned ? 'border-green-100 dark:border-green-900/50' : 'dark:border-slate-700'}`}>
                    {editingId === card.id ? (
                      <div className="space-y-3">
                        <input className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg" value={editValues.word} onChange={e => setEditValues({...editValues, word: e.target.value})} placeholder="Word" />
                        <input className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg" value={editValues.meaning} onChange={e => setEditValues({...editValues, meaning: e.target.value})} placeholder="Meaning" />
                        <textarea className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg" value={editValues.example} onChange={e => setEditValues({...editValues, example: e.target.value})} placeholder="Example" />
                        <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"><Save size={16} /> 保存</button><button onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 py-2 rounded-lg text-sm font-bold">キャンセル</button></div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleLearned(card.id)} className={`transition-colors ${card.isLearned ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}>{card.isLearned ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
                            <h4 className={`font-bold text-lg ${card.isLearned ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>{card.word}</h4>
                            <button onClick={() => speak(card.word)} className="text-slate-400 hover:text-indigo-600"><Volume2 size={16} /></button>
                          </div>
                          <p className={`${card.isLearned ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'} font-medium`}>{card.meaning}</p>
                          {card.example && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 italic">
                              <button onClick={() => speak(card.example)} className="mt-1 flex-shrink-0 text-slate-400 hover:text-indigo-500"><Volume2 size={14} /></button>
                              <p>{card.example}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => startEditing(card)} className="p-2 text-slate-400 hover:text-indigo-500 transition"><Edit2 size={18} /></button>
                          <button onClick={() => deleteCard(card.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Mode & Settings (similar logic) */}
          {activeTab === 'add' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-indigo-600" /> 単語を追加</h2>
              <form onSubmit={addCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">英単語 *</label>
                  <input required type="text" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition" value={newCard.word} onChange={e => setNewCard({...newCard, word: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">意味 *</label>
                  <input required type="text" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition" value={newCard.meaning} onChange={e => setNewCard({...newCard, meaning: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">例文</label>
                  <textarea rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition" value={newCard.example} onChange={e => setNewCard({...newCard, example: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md active:scale-95">保存</button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border dark:border-slate-700 animate-in fade-in duration-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-indigo-600" /> 音声設定</h2>
              <div className="space-y-4">
                <div className="max-h-80 overflow-y-auto border dark:border-slate-700 rounded-xl divide-y dark:divide-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  {voices.map(voice => (
                    <button key={voice.voiceURI} onClick={() => setSelectedVoiceURI(voice.voiceURI)} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition ${selectedVoiceURI === voice.voiceURI ? 'bg-indigo-50 dark:bg-indigo-900/30 font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                      <div className="flex flex-col"><span>{voice.name}</span><span className="text-xs text-slate-400">{voice.lang}</span></div>
                      {selectedVoiceURI === voice.voiceURI && <Check size={18} />}
                    </button>
                  ))}
                </div>
                <button onClick={() => speak("Voice test complete.")} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">テスト再生</button>
                <button onClick={() => setActiveTab('study')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mt-4 shadow-md active:scale-95 transition">完了</button>
              </div>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t dark:border-slate-700 px-4 py-2 flex justify-around items-center z-30 safe-area-bottom">
          <NavButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<BookOpen size={20} />} label="学習" />
          <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<Search size={20} />} label="一覧" />
          <NavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<Plus size={24} />} label="追加" isPrimary />
        </nav>

        <style dangerouslySetInnerHTML={{ __html: `
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
          .safe-area-bottom { padding-bottom: calc(0.5rem + env(safe-area-inset-bottom)); }
        `}} />
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, isPrimary = false }) => {
  if (isPrimary) {
    return (
      <button onClick={onClick} className={`flex flex-col items-center justify-center -mt-8 w-14 h-14 rounded-full shadow-lg transition transform active:scale-95 ${active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600'}`}>
        {icon}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 py-1 transition ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{icon}<span className="text-xs font-medium">{label}</span></button>
  );
};

export default App;
