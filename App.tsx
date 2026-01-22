
import React, { useState, useEffect } from 'react';
import { CORE_VOCAB } from './constants';
import { AACSymbol, WordType } from './types';
import { AACCard } from './components/AACCard';
import { SentenceStrip } from './components/SentenceStrip';
import { SettingsModal } from './components/SettingsModal';
import { AddWordModal } from './components/AddWordModal';
import { speak } from './services/ttsService';
import { predictNextSymbols } from './services/geminiService';
import { Sparkles, Edit3, XCircle, Settings, ArrowRightLeft } from 'lucide-react';

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
          const saved = localStorage.getItem('aac-voice-settings');
          return saved ? JSON.parse(saved) : { pitch: 1.0, rate: 1.0 };
      } catch {
          return { pitch: 1.0, rate: 1.0 };
      }
  });

  const [sentence, setSentence] = useState<AACSymbol[]>([]);
  const [currentView, setCurrentView] = useState<'HOME' | 'AI'>('HOME');
  const [predictedSymbols, setPredictedSymbols] = useState<AACSymbol[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  
  // ADD WORD STATE
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  // SWAP/REORDER STATE
  const [moveSourceId, setMoveSourceId] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('aac-core-vocab', JSON.stringify(coreVocab));
    } catch (e) { console.warn('Storage Error', e); }
  }, [coreVocab]);

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


  // Responsive Hook Logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth >= 768;

  // --- INTERACTION HANDLERS ---

  const handleSymbolClick = (symbol: AACSymbol) => {
    // Spacer check (Handled inside AACCard mostly, but just in case)
    if (symbol.color === 'placeholder') return;

    // 1. EDIT MODE: SWAP LOGIC
    if (isEditMode && moveSourceId) {
      handleSwapSymbols(moveSourceId, symbol.id);
      return; 
    }
    
    // 2. NORMAL MODE
    const newSentence = [...sentence, symbol];
    setSentence(newSentence);
    
    // Feedback
    speak(symbol.label, undefined, undefined, voiceSettings.pitch, voiceSettings.rate);

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
      speak("Chọn vị trí mới", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
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
        speak("Đã chuyển", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
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
        voiceSettings.rate
    );
  };

  const handleClear = () => setSentence([]);
  const handleRemoveLast = () => setSentence(prev => prev.slice(0, -1));

  const handleAiPrediction = async () => {
    if (sentence.length === 0) return;
    setIsAiLoading(true);
    setCurrentView('AI');
    const predictions = await predictNextSymbols(sentence.map(s => s.label));
    setPredictedSymbols(predictions);
    setIsAiLoading(false);
  };

  const handleImageUpdate = (updatedSymbol: AACSymbol, base64Image: string) => {
    const newSymbol = { ...updatedSymbol, image: base64Image };
    const coreIndex = coreVocab.findIndex(s => s.id === newSymbol.id);
    if (coreIndex !== -1) {
        const newVocab = [...coreVocab];
        newVocab[coreIndex] = newSymbol;
        setCoreVocab(newVocab);
    }
    speak("Đã lưu ảnh", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
  };

  const handleImageReset = (symbolToReset: AACSymbol) => {
    const { image, ...rest } = symbolToReset;
    const newSymbol = { ...rest, image: undefined };
    const coreIndex = coreVocab.findIndex(s => s.id === newSymbol.id);
    if (coreIndex !== -1) {
        const newVocab = [...coreVocab];
        newVocab[coreIndex] = newSymbol;
        setCoreVocab(newVocab);
    }
    speak("Đã khôi phục", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
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
              id: selectedSlotId, // Keep original ID (e.g. sp1) so we track position
              label: label,
              image: image || undefined, // undefined if null
              emoji: image ? undefined : '⭐', // Default emoji if no image
              color: 'bg-white border-slate-300', // White for "Things/Fringe"
              type: WordType.NOUN 
          };
          setCoreVocab(newVocab);
          speak("Đã thêm từ", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
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
          speak("Đã xóa", undefined, undefined, voiceSettings.pitch, voiceSettings.rate);
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

      <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 safe-bottom">
        
        {/* Controls */}
        <div className="mb-2 flex justify-between items-center px-2">
            <div className="flex-1">
                 <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 md:p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                 >
                    <Settings size={24} />
                 </button>
             </div>

            <div className="flex-1 flex justify-center">
                 {appSettings.showAIBtn && sentence.length > 0 && currentView !== 'AI' && !isEditMode && (
                    <button 
                        onClick={handleAiPrediction}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-bold shadow-md hover:shadow-lg transform transition hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        <Sparkles size={16} />
                        <span>Đoán từ</span>
                    </button>
                 )}
            </div>

            <div className="flex-1 flex justify-end">
                {appSettings.showEditBtn && (
                    <button
                        onClick={() => {
                            setIsEditMode(!isEditMode);
                            setMoveSourceId(null); 
                        }}
                        className={`
                            p-2 md:p-3 rounded-full shadow-lg border-2 transition-all
                            ${isEditMode 
                                ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse' 
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                            }
                        `}
                    >
                        {isEditMode ? <XCircle size={20} className="md:w-6 md:h-6" /> : <Edit3 size={20} className="md:w-6 md:h-6" />}
                    </button>
                )}
            </div>
        </div>
        
        {isEditMode && (
            <div className="text-center mb-4 p-2 bg-indigo-50 text-indigo-800 rounded-lg text-xs md:text-sm border border-indigo-200 mx-2 flex flex-col gap-1">
                <span>Chế độ chỉnh sửa đang bật.</span>
                <span className="text-[10px] opacity-80">
                   Nhấn vào ô trống (➕) để thêm từ mới. Nhấn vào thẻ để sửa ảnh.
                </span>
                {moveSourceId && (
                     <div className="mt-2 bg-yellow-100 text-yellow-800 p-1 rounded border border-yellow-300 font-bold animate-pulse">
                        Đang chọn vị trí... Nhấn vào thẻ khác để hoán đổi.
                     </div>
                )}
            </div>
        )}

        {/* AI PREDICTION VIEW */}
        {currentView === 'AI' && (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="font-bold text-slate-500 text-sm uppercase">Gợi ý AI</h3>
                    <button onClick={() => setCurrentView('HOME')} className="text-blue-500 text-sm font-bold">Đóng</button>
                </div>
                
                {isAiLoading && (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
                    </div>
                )}
                
                {!isAiLoading && predictedSymbols.length === 0 && (
                     <div className="text-center p-4 text-slate-400 italic">Không có gợi ý.</div>
                )}

                <div className={`grid ${isTablet ? 'grid-cols-8 gap-3 md:gap-4' : 'grid-cols-4 gap-2'}`}>
                    {predictedSymbols.map(symbol => (
                         <AACCard key={symbol.id} symbol={symbol} onClick={handleSymbolClick} />
                    ))}
                </div>
                <hr className="my-4 border-slate-200" />
            </div>
        )}

        {/* MAIN GRID */}
        {currentView === 'HOME' && (
             <div className={`
               grid 
               ${isTablet ? 'grid-cols-8 gap-3 md:gap-4' : 'grid-cols-4 gap-2'}
               auto-rows-min
             `}>
               {coreVocab.map(symbol => (
                   <AACCard 
                       key={symbol.id} 
                       symbol={symbol} 
                       onClick={handleSymbolClick} 
                       isEditMode={isEditMode}
                       onImageUpdate={handleImageUpdate}
                       onImageReset={handleImageReset}
                       onMoveStart={handleMoveStart}
                       isMoving={moveSourceId === symbol.id}
                       isSwapModeActive={!!moveSourceId}
                       onAddWord={handleAddWordClick}
                       onDeleteWord={handleDeleteCustomWord}
                   />
               ))}
             </div>
        )}
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={appSettings}
        onUpdateSettings={handleSettingsUpdate}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleVoiceSettingsUpdate}
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
