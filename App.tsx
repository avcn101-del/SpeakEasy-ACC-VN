
import React, { useState, useEffect } from 'react';
import { CORE_VOCAB } from './constants';
import { AACSymbol, WordType } from './types';
import { AACCard } from './components/AACCard';
import { SentenceStrip } from './components/SentenceStrip';
import { SettingsModal } from './components/SettingsModal';
import { AddWordModal } from './components/AddWordModal';
import { VocabularyModal } from './components/VocabularyModal';
import { speak } from './services/ttsService';
import { predictNextSymbols } from './services/geminiService';
import { Sparkles, Edit3, XCircle, Settings, BookOpen } from 'lucide-react';

// Animation style
const ANIMATION_STYLES = `
  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pop {
    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

export interface AppSettings {
    showEditBtn: boolean;
    showAIBtn: boolean;
}

export interface VoiceSettings {
    pitch: number;
    rate: number;
    forceOnline: boolean;
}

function App() {
  // State for Vocab initialized from LocalStorage
  const [coreVocab, setCoreVocab] = useState<AACSymbol[]>(() => {
    try {
      const saved = localStorage.getItem('aac-core-vocab');
      return saved ? JSON.parse(saved) : CORE_VOCAB;
    } catch (e) {
      return CORE_VOCAB;
    }
  });

  // State for Custom Fringe Images (Map ID -> Base64)
  const [customFringeImages, setCustomFringeImages] = useState<Record<string, string>>(() => {
      try {
          const saved = localStorage.getItem('aac-fringe-images');
          return saved ? JSON.parse(saved) : {};
      } catch {
          return {};
      }
  });

  // --- INTERFACE SETTINGS (Kid Mode) ---
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
      try {
          const saved = localStorage.getItem('aac-app-settings');
          return saved ? JSON.parse(saved) : { showEditBtn: true, showAIBtn: true };
      } catch {
          return { showEditBtn: true, showAIBtn: true };
      }
  });

  // --- VOICE SETTINGS ---
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
      try {
          const defaults = { pitch: 1.0, rate: 1.0, forceOnline: false };
          const saved = localStorage.getItem('aac-voice-settings');
          if (saved) {
              const parsed = JSON.parse(saved);
              return { ...defaults, ...parsed };
          }
          return defaults;
      } catch {
          return { pitch: 1.0, rate: 1.0, forceOnline: false };
      }
  });

  const [sentence, setSentence] = useState<AACSymbol[]>([]);
  const [currentView, setCurrentView] = useState<'HOME' | 'AI'>('HOME');
  const [predictedSymbols, setPredictedSymbols] = useState<AACSymbol[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVocabularyOpen, setIsVocabularyOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  
  // ADD WORD STATE
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  // SWAP/REORDER STATE
  const [moveSourceId, setMoveSourceId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('aac-core-vocab', JSON.stringify(coreVocab));
    } catch (e) { console.warn('Storage Error', e); }
  }, [coreVocab]);

  useEffect(() => {
      try {
          localStorage.setItem('aac-fringe-images', JSON.stringify(customFringeImages));
      } catch (e) { console.warn('Storage Error', e); }
  }, [customFringeImages]);

  useEffect(() => {
      try {
          localStorage.setItem('aac-app-settings', JSON.stringify(appSettings));
      } catch (e) { console.warn('Storage Error', e); }
  }, [appSettings]);

  useEffect(() => {
      try {
          localStorage.setItem('aac-voice-settings', JSON.stringify(voiceSettings));
      } catch (e) { console.warn('Storage Error', e); }
  }, [voiceSettings]);


  // Init Voice
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // --- GLOBAL VOCAB UPDATE HANDLERS ---
  // These handle updates for both Core (via state) and Fringe (via map)
  
  const handleGlobalImageUpdate = (id: string, base64: string) => {
    // 1. Check if it's in Core Vocab
    const coreIndex = coreVocab.findIndex(s => s.id === id);
    if (coreIndex !== -1) {
        // Update Core State
        const newVocab = [...coreVocab];
        newVocab[coreIndex] = { ...newVocab[coreIndex], image: base64 };
        setCoreVocab(newVocab);
    } else {
        // Update Fringe Map
        setCustomFringeImages(prev => ({ ...prev, [id]: base64 }));
    }
    speak("Đã lưu ảnh", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
  };

  const handleGlobalImageReset = (id: string) => {
    // 1. Check if it's in Core Vocab
    const coreIndex = coreVocab.findIndex(s => s.id === id);
    if (coreIndex !== -1) {
        // Reset Core State
        const newVocab = [...coreVocab];
        // Remove image property
        const { image, ...rest } = newVocab[coreIndex];
        newVocab[coreIndex] = { ...rest, image: undefined };
        setCoreVocab(newVocab);
    } else {
        // Reset Fringe Map
        const newMap = { ...customFringeImages };
        delete newMap[id];
        setCustomFringeImages(newMap);
    }
    speak("Đã khôi phục", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
  };


  // --- INTERACTION HANDLERS ---

  const handleSymbolClick = (symbol: AACSymbol) => {
    // Spacer check
    if (symbol.color === 'placeholder') return;

    // 1. EDIT MODE: SWAP LOGIC (Only applies to Core Vocab in Home View)
    if (isEditMode && currentView === 'HOME' && moveSourceId) {
      handleSwapSymbols(moveSourceId, symbol.id);
      return; 
    }
    
    // 2. NORMAL MODE
    // Apply custom image override if it exists (for AI or Library items)
    const finalSymbol = {
        ...symbol,
        image: customFringeImages[symbol.id] || symbol.image
    };

    const newSentence = [...sentence, finalSymbol];
    setSentence(newSentence);
    
    // Feedback
    speak(
        finalSymbol.label, 
        undefined, 
        undefined, 
        voiceSettings.pitch, 
        voiceSettings.rate, 
        voiceSettings.forceOnline
    );

    // Scroll
    setTimeout(() => {
      document.getElementById('sentence-end')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    if (currentView === 'AI') {
        setCurrentView('HOME');
        setPredictedSymbols([]);
    }
  };

  const handleMoveStart = (symbol: AACSymbol) => {
      if (symbol.color === 'placeholder') return;
      setMoveSourceId(symbol.id);
      speak("Chọn vị trí mới", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
  };

  const handleSwapSymbols = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) {
        setMoveSourceId(null);
        return;
    }

    const sourceIndex = coreVocab.findIndex(s => s.id === sourceId);
    const targetIndex = coreVocab.findIndex(s => s.id === targetId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
        const newVocab = [...coreVocab];
        [newVocab[sourceIndex], newVocab[targetIndex]] = [newVocab[targetIndex], newVocab[sourceIndex]];
        setCoreVocab(newVocab);
        speak("Đã chuyển", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
    }
    setMoveSourceId(null);
  };

  const handleSpeakSentence = () => {
    if (sentence.length === 0) return;
    const text = sentence.map(s => s.label).join(' ');
    
    speak(
        text, 
        () => setIsSpeaking(true),  
        () => setIsSpeaking(false),
        voiceSettings.pitch,
        voiceSettings.rate,
        voiceSettings.forceOnline
    );
  };

  const handleClear = () => setSentence([]);
  const handleRemoveLast = () => setSentence(prev => prev.slice(0, -1));

  const handleAiPrediction = async () => {
    if (sentence.length === 0) return;
    setIsAiLoading(true);
    setCurrentView('AI');
    const predictions = await predictNextSymbols(sentence.map(s => s.label));
    
    // Hydrate predictions with custom images
    const hydratedPredictions = predictions.map(p => ({
        ...p,
        image: customFringeImages[p.id] || p.image
    }));

    setPredictedSymbols(hydratedPredictions);
    setIsAiLoading(false);
  };
  
  // --- ADD WORD LOGIC ---
  const handleAddWordClick = (slotId: string) => {
      setSelectedSlotId(slotId);
      setIsAddModalOpen(true);
  };

  const handleSaveNewWord = (label: string, image: string | null) => {
      if (!selectedSlotId) return;
      
      const newVocab = [...coreVocab];
      const slotIndex = newVocab.findIndex(s => s.id === selectedSlotId);
      
      if (slotIndex !== -1) {
          newVocab[slotIndex] = {
              id: selectedSlotId, 
              label: label,
              image: image || undefined, 
              emoji: image ? undefined : '⭐', 
              color: 'bg-white border-slate-300', 
              type: WordType.NOUN 
          };
          setCoreVocab(newVocab);
          speak("Đã thêm từ", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
      }
      
      setIsAddModalOpen(false);
      setSelectedSlotId(null);
  };

  const handleDeleteCustomWord = (id: string) => {
      const newVocab = [...coreVocab];
      const slotIndex = newVocab.findIndex(s => s.id === id);
      
      if (slotIndex !== -1) {
          // Revert to placeholder
          newVocab[slotIndex] = {
              id: id,
              label: '',
              emoji: '',
              color: 'placeholder',
              type: WordType.NOUN
          };
          setCoreVocab(newVocab);
          speak("Đã xóa", undefined, undefined, voiceSettings.pitch, voiceSettings.rate, voiceSettings.forceOnline);
      }
  }

  const handleSettingsUpdate = (newSettings: AppSettings) => {
      setAppSettings(newSettings);
      if (!newSettings.showEditBtn) {
          setIsEditMode(false);
          setMoveSourceId(null);
      }
  };

  const handleVoiceSettingsUpdate = (newVoiceSettings: VoiceSettings) => {
      setVoiceSettings(newVoiceSettings);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <style>{ANIMATION_STYLES}</style>
      
      <SentenceStrip 
        sentence={sentence} 
        onClear={handleClear} 
        onRemoveLast={handleRemoveLast} 
        onSpeak={handleSpeakSentence}
        isSpeaking={isSpeaking}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-6 pb-32 safe-bottom">
        <div className="max-w-screen-2xl mx-auto">

            {/* Controls */}
            <div className="mb-4 flex justify-between items-center px-1">
                {/* Left Group */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 md:p-4 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors active:scale-95 bg-white border border-slate-200 shadow-sm"
                        aria-label="Cài đặt"
                    >
                        <Settings size={24} className="md:w-6 md:h-6" />
                    </button>
                    
                    {/* NEW LIBRARY BUTTON */}
                    <button
                        onClick={() => setIsVocabularyOpen(true)}
                        className="p-3 md:p-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors active:scale-95 bg-white border border-indigo-100 shadow-sm"
                        aria-label="Kho từ vựng"
                    >
                        <BookOpen size={24} className="md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="flex-1 flex justify-center">
                    {appSettings.showAIBtn && sentence.length > 0 && currentView !== 'AI' && !isEditMode && (
                        <button 
                            onClick={handleAiPrediction}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform transition hover:scale-105 active:scale-95 text-base md:text-xl"
                        >
                            <Sparkles size={20} className="md:w-6 md:h-6" />
                            <span>Đoán từ</span>
                        </button>
                    )}
                </div>

                <div className="flex justify-end">
                    {appSettings.showEditBtn && (
                        <button
                            onClick={() => {
                                setIsEditMode(!isEditMode);
                                setMoveSourceId(null); 
                            }}
                            className={`
                                p-3 md:p-4 rounded-full shadow-lg border-2 transition-all active:scale-95
                                ${isEditMode 
                                    ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                }
                            `}
                        >
                            {isEditMode ? <XCircle size={24} className="md:w-6 md:h-6" /> : <Edit3 size={24} className="md:w-6 md:h-6" />}
                        </button>
                    )}
                </div>
            </div>
            
            {isEditMode && (
                <div className="text-center mb-6 p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm md:text-base border-2 border-indigo-200 mx-1 flex flex-col gap-2 shadow-sm">
                    <span className="font-bold">Chế độ sắp xếp</span>
                    <span className="opacity-80">
                    Nhấn nút <BookOpen className="inline w-4 h-4"/> để chỉnh sửa hình ảnh.
                    Nhấn vào thẻ để di chuyển vị trí. 
                    Nhấn vào ô trống (➕) để thêm từ mới.
                    </span>
                    {moveSourceId && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-lg border border-yellow-300 font-bold animate-pulse">
                            Đang chọn vị trí... Nhấn vào thẻ khác để hoán đổi.
                        </div>
                    )}
                </div>
            )}

            {/* AI PREDICTION VIEW */}
            {currentView === 'AI' && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-bold text-slate-500 text-base md:text-lg uppercase">Gợi ý AI</h3>
                        <button onClick={() => setCurrentView('HOME')} className="text-blue-600 text-base md:text-lg font-bold px-4 py-2 bg-blue-50 rounded-lg">Đóng</button>
                    </div>
                    
                    {isAiLoading && (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-500"></div>
                        </div>
                    )}
                    
                    {!isAiLoading && predictedSymbols.length === 0 && (
                        <div className="text-center p-8 text-slate-400 italic text-lg">Không có gợi ý.</div>
                    )}

                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
                        {predictedSymbols.map(symbol => (
                            <AACCard 
                                key={symbol.id} 
                                symbol={symbol} 
                                onClick={handleSymbolClick} 
                                isEditMode={false} // No editing in AI view
                            />
                        ))}
                    </div>
                    <hr className="my-8 border-slate-200" />
                </div>
            )}

            {/* MAIN GRID */}
            {currentView === 'HOME' && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4 lg:gap-5 pb-20">
                {coreVocab.map(symbol => (
                    <AACCard 
                        key={symbol.id} 
                        symbol={symbol} 
                        onClick={handleSymbolClick} 
                        isEditMode={isEditMode}
                        onMoveStart={handleMoveStart}
                        isMoving={moveSourceId === symbol.id}
                        isSwapModeActive={!!moveSourceId}
                        onAddWord={handleAddWordClick}
                        onDeleteWord={handleDeleteCustomWord}
                        // Note: onImageUpdate removed from here. Editing happens in Library.
                    />
                ))}
                </div>
            )}
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={appSettings}
        onUpdateSettings={handleSettingsUpdate}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleVoiceSettingsUpdate}
      />

      <VocabularyModal
        isOpen={isVocabularyOpen}
        onClose={() => setIsVocabularyOpen(false)}
        onSelectSymbol={handleSymbolClick}
        isEditMode={isEditMode}
        coreVocab={coreVocab} // Pass Core
        customImages={customFringeImages}
        onUpdateImage={handleGlobalImageUpdate} // Unified Handler
        onResetImage={handleGlobalImageReset} // Unified Handler
      />

      <AddWordModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewWord}
        categoryLabel="Từ riêng"
      />

      <div className="h-safe-bottom bg-transparent" />
    </div>
  );
}

export default App;
