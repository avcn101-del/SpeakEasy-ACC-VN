
import React, { useRef } from 'react';
import { AACSymbol } from '../types';
import { Camera, RotateCcw, ArrowRightLeft, Plus, Trash2 } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

interface AACCardProps {
  symbol: AACSymbol;
  onClick: (symbol: AACSymbol) => void;
  isCompact?: boolean;
  isEditMode?: boolean;
  onImageUpdate?: (symbol: AACSymbol, base64Image: string) => void;
  onImageReset?: (symbol: AACSymbol) => void;
  onMoveStart?: (symbol: AACSymbol) => void;
  isMoving?: boolean; 
  isSwapModeActive?: boolean;
  onAddWord?: (symbolId: string) => void;
  onDeleteWord?: (symbolId: string) => void;
}

export const AACCard: React.FC<AACCardProps> = ({ 
  symbol, 
  onClick, 
  isCompact, 
  isEditMode, 
  onImageUpdate,
  onImageReset,
  onMoveStart,
  isMoving,
  isSwapModeActive,
  onAddWord,
  onDeleteWord
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- CHECK IF THIS IS A PLACEHOLDER SLOT ---
  const isPlaceholder = symbol.color === 'placeholder';
  // Check if this was a placeholder that has been filled (custom word)
  // It has a 'sp' ID but a valid color
  const isCustomFilled = symbol.id.startsWith('sp') && !isPlaceholder;

  // --- RENDER LOGIC: INVISIBLE SPACER ---
  // If it's a placeholder AND we are NOT in edit mode, it should be an invisible gap.
  if (isPlaceholder && !isEditMode) {
      return <div className="w-full aspect-square md:aspect-[4/3] pointer-events-none" />;
  }

  const handleCardClick = () => {
    if (isEditMode) {
      if (isPlaceholder) {
          // Clicked an empty slot -> Add Word
          if (onAddWord) onAddWord(symbol.id);
      } else if (isSwapModeActive) {
         // If swapping, perform swap
         onClick(symbol); 
      } else {
         // Normal Edit: Change Image
         fileInputRef.current?.click();
      }
    } else {
      // Normal Mode: Speak
      onClick(symbol);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpdate) {
      try {
        const compressedBase64 = await compressImage(file);
        onImageUpdate(symbol, compressedBase64);
      } catch (error) {
        console.error("Error compressing card image:", error);
        alert("Ảnh quá lớn hoặc lỗi. Vui lòng thử ảnh khác.");
      }
    }
  };

  // --- RENDER LOGIC: EMPTY ADD BUTTON (Edit Mode Only) ---
  if (isPlaceholder && isEditMode) {
      return (
        <button
            onClick={handleCardClick}
            className="w-full aspect-square md:aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all animate-pop"
        >
            <Plus size={32} />
            <span className="text-xs font-bold mt-1">Thêm</span>
        </button>
      );
  }

  // --- RENDER LOGIC: STANDARD CARD ---
  return (
    <button
      onClick={handleCardClick}
      className={`
        relative group
        flex flex-col items-center justify-center
        aspect-square md:aspect-[4/3]
        w-full
        ${symbol.color}
        border-b-4 border-r-4 rounded-xl md:rounded-2xl
        active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1
        transition-all duration-75
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400
        select-none overflow-hidden
        ${isEditMode ? 'ring-2 ring-indigo-500 border-indigo-400 border-dashed' : ''}
        ${isMoving ? 'ring-4 ring-yellow-400 border-yellow-500 bg-yellow-100 animate-pulse scale-95' : ''}
      `}
      aria-label={isEditMode ? `Sửa ảnh cho ${symbol.label}` : symbol.label}
    >
      {/* Hit Slop Expansion */}
      <span className="absolute -inset-2 md:-inset-4 bg-transparent pointer-events-auto z-10" />

      {/* Content Rendering: Custom Image or Emoji */}
      {symbol.image ? (
        <img 
          src={symbol.image} 
          alt={symbol.label} 
          className="h-10 w-10 md:h-16 md:w-16 object-cover rounded-lg mb-1 pointer-events-none"
        />
      ) : (
        <span className="text-3xl md:text-5xl mb-1 filter drop-shadow-sm pointer-events-none leading-none">
          {symbol.emoji}
        </span>
      )}

      <span className={`
        font-bold text-slate-900 uppercase tracking-tight pointer-events-none leading-tight px-1 break-words w-full
        ${isCompact ? 'text-[10px]' : 'text-[11px] md:text-base'}
      `}>
        {symbol.label}
      </span>

      {/* Edit Mode Overlays */}
      {isEditMode && !isMoving && (
        <>
            {/* Center Camera Icon - Purely Visual Indicator */}
            {/* We only show this if NOT swapping, to indicate 'Click me to Edit' */}
            {!isSwapModeActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm">
                        <Camera size={24} className="text-white drop-shadow-md" />
                     </div>
                </div>
            )}
            
            {/* MOVE BUTTON (Top Left) - Only for Core words, not Custom Filled (optional choice, but let's keep it consistent) */}
            {!isSwapModeActive && (
                <div 
                    role="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if(onMoveStart) onMoveStart(symbol);
                    }}
                    className="absolute top-1 left-1 md:top-2 md:left-2 z-50 bg-white text-slate-700 p-1.5 md:p-2 rounded-full shadow-md hover:bg-yellow-100 hover:text-yellow-600 transition-colors border border-slate-200 pointer-events-auto active:scale-95"
                    title="Di chuyển / Sắp xếp lại"
                >
                    <ArrowRightLeft size={14} className="md:w-4 md:h-4" />
                </div>
            )}

            {/* RESET/DELETE BUTTON (Top Right) */}
            {/* If Custom Filled -> Show Trash Can to Delete */}
            {/* If Core with Image -> Show Undo to Reset Image */}
            {!isSwapModeActive && (
                <div 
                    role="button"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (isCustomFilled && onDeleteWord) {
                            if(confirm("Xóa từ này và để trống?")) onDeleteWord(symbol.id);
                        } else if (symbol.image && onImageReset) {
                            onImageReset(symbol);
                        }
                    }}
                    className={`
                        absolute top-1 right-1 md:top-2 md:right-2 z-50 bg-white p-1.5 md:p-2 rounded-full shadow-md transition-colors border border-slate-200 pointer-events-auto active:scale-95
                        ${isCustomFilled ? 'text-red-600 hover:bg-red-100' : 'text-slate-700 hover:bg-slate-100'}
                    `}
                    title={isCustomFilled ? "Xóa từ này" : "Khôi phục hình gốc"}
                >
                    {isCustomFilled ? <Trash2 size={14} className="md:w-4 md:h-4" /> : <RotateCcw size={14} className="md:w-4 md:h-4" />}
                </div>
            )}

            {/* Hidden File Input for Camera/Gallery */}
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </>
      )}

      {/* "Select Me" Overlay when Swapping */}
      {isSwapModeActive && !isMoving && (
          <div className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-400 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
             <div className="bg-white/80 px-2 py-1 rounded text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-sm">
                Chọn
             </div>
          </div>
      )}

      {/* Selected Source Overlay */}
      {isMoving && (
          <div className="absolute inset-0 bg-yellow-200/50 flex items-center justify-center font-bold text-yellow-800 text-sm p-2 text-center rounded-xl pointer-events-none">
             Đang di chuyển...
          </div>
      )}
    </button>
  );
};
