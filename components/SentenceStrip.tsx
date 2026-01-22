
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
    <div className="bg-white border-b border-slate-200 p-2 md:p-4 shadow-sm z-50 sticky top-0 safe-top">
      <div className="flex items-center gap-2 max-w-7xl mx-auto h-20 md:h-24">
        
        {/* Sentence Container */}
        <div className={`
            flex-1 bg-slate-100 rounded-xl border-2 h-full flex items-center px-2 overflow-x-auto no-scrollbar gap-2 transition-all duration-300
            ${isSpeaking ? 'border-green-400 bg-green-50 shadow-[0_0_15px_rgba(74,222,128,0.5)] scale-[1.01]' : 'border-slate-200'}
        `}>
          {sentence.length === 0 && (
            <span className="text-slate-400 italic text-lg ml-2">Chọn hình...</span>
          )}
          {sentence.map((sym, idx) => (
            <div key={`${sym.id}-${idx}`} className="flex-shrink-0 flex items-center bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm animate-pop">
              <span className="text-2xl mr-2">{sym.emoji}</span>
              <span className="font-bold text-slate-700">{sym.label}</span>
            </div>
          ))}
          {/* Invisible spacer to scroll to end */}
          <div id="sentence-end" className="w-1 h-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 md:gap-3 pl-2">
           <button 
            onClick={onRemoveLast}
            disabled={sentence.length === 0}
            className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl border-b-4 border-orange-200 active:border-b-0 active:translate-y-1 disabled:opacity-50"
            aria-label="Xóa từ cuối"
          >
            <Delete size={28} />
          </button>

          <button 
            onClick={onClear}
            disabled={sentence.length === 0}
            className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-red-100 text-red-600 rounded-xl border-b-4 border-red-200 active:border-b-0 active:translate-y-1 disabled:opacity-50"
            aria-label="Xóa tất cả"
          >
            <Trash2 size={28} />
          </button>

          <button 
            onClick={onSpeak}
            disabled={sentence.length === 0}
            className={`
                h-14 w-20 md:h-16 md:w-24 flex items-center justify-center text-white rounded-xl border-b-4 active:border-b-0 active:translate-y-1 shadow-md disabled:opacity-50 disabled:bg-slate-300 disabled:border-slate-400 transition-all
                ${isSpeaking ? 'bg-green-600 border-green-800 scale-95' : 'bg-green-500 border-green-700'}
            `}
            aria-label="Đọc câu"
          >
            <Play size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
