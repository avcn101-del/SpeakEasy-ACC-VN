
import React from 'react';
import { AACSymbol } from '../types';
import { Trash2, Play, Delete } from 'lucide-react';

interface SentenceStripProps {
  sentence: AACSymbol[];
  onRemoveLast: () => void;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking?: boolean;
}

export const SentenceStrip: React.FC<SentenceStripProps> = ({ sentence, onRemoveLast, onClear, onSpeak, isSpeaking }) => {
  return (
    <div className="bg-white border-b-2 border-slate-200 p-2 md:p-3 shadow-md z-50 sticky top-0 safe-top">
      <div className="flex items-center gap-2 md:gap-4 max-w-screen-2xl mx-auto h-20 md:h-28">
        
        {/* Sentence Container */}
        <div className={`
            flex-1 bg-slate-50 rounded-2xl border-2 h-full flex items-center px-3 overflow-x-auto no-scrollbar gap-2 transition-all duration-300
            ${isSpeaking ? 'border-green-400 bg-green-50 shadow-[0_0_15px_rgba(74,222,128,0.5)] scale-[1.01]' : 'border-slate-200'}
        `}>
          {sentence.length === 0 && (
            <span className="text-slate-400 italic text-lg md:text-2xl ml-2 font-medium">Chọn hình...</span>
          )}
          {sentence.map((sym, idx) => (
            <div key={`${sym.id}-${idx}`} className="flex-shrink-0 flex items-center bg-white px-3 py-1.5 md:py-2 rounded-xl border-b-2 border-r-2 border-slate-200 shadow-sm animate-pop">
              <span className="text-2xl md:text-4xl mr-2">{sym.emoji}</span>
              <span className="font-bold text-slate-800 text-sm md:text-xl">{sym.label}</span>
            </div>
          ))}
          {/* Invisible spacer to scroll to end */}
          <div id="sentence-end" className="w-2 h-full" />
        </div>

        {/* Action Buttons - Optimized Size for Touch */}
        <div className="flex gap-2 md:gap-3 pl-1 md:pl-2 shrink-0">
           <button 
            onClick={onRemoveLast}
            disabled={sentence.length === 0}
            className="h-16 w-16 md:h-24 md:w-24 flex items-center justify-center bg-orange-50 text-orange-600 rounded-2xl border-b-4 border-orange-200 hover:bg-orange-100 active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all"
            aria-label="Xóa từ cuối"
          >
            <Delete size={28} className="md:w-10 md:h-10" />
          </button>

          <button 
            onClick={onClear}
            disabled={sentence.length === 0}
            className="h-16 w-16 md:h-24 md:w-24 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl border-b-4 border-red-200 hover:bg-red-100 active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all"
            aria-label="Xóa tất cả"
          >
            <Trash2 size={28} className="md:w-10 md:h-10" />
          </button>

          <button 
            onClick={onSpeak}
            disabled={sentence.length === 0}
            className={`
                h-16 w-20 md:h-24 md:w-32 flex items-center justify-center text-white rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg disabled:opacity-50 disabled:bg-slate-300 disabled:border-slate-400 transition-all
                ${isSpeaking ? 'bg-green-600 border-green-800 scale-95' : 'bg-green-500 hover:bg-green-400 border-green-700'}
            `}
            aria-label="Đọc câu"
          >
            <Play size={36} className="md:w-12 md:h-12" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
