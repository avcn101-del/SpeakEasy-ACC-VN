
import React from 'react';
import { AACSymbol } from '../types';
import { RotateCcw, ArrowRightLeft, Plus, Trash2, Camera } from 'lucide-react';
// Note: compressImage and useRef are no longer needed here if we remove upload logic

interface AACCardProps {
  symbol: AACSymbol;
  onClick: (symbol: AACSymbol) => void;
  isCompact?: boolean;
  isEditMode?: boolean;
  onImageUpdate?: (symbol: AACSymbol, base64Image: string) => void; // Kept optional for VocabularyModal
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
  // Removed local fileInputRef logic. 
  // We now only trigger onImageUpdate via the passed prop if it exists (which happens in Modal), 
  // OR we use a different mechanism.
  // Actually, to support Modal editing, we need the file input ONLY if onImageUpdate is provided.
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canEditImage = isEditMode && !!onImageUpdate; // Only enable image editing if a handler is passed

  // --- CHECK IF THIS IS A PLACEHOLDER SLOT ---
  const isPlaceholder = symbol.color === 'placeholder';
  const isCustomFilled = symbol.id.startsWith('sp') && !isPlaceholder;

  // --- RENDER LOGIC: INVISIBLE SPACER ---
  if (isPlaceholder && !isEditMode) {
      return <div className="w-full aspect-square md:aspect-[5/4] pointer-events-none" />;
  }

  const handleCardClick = () => {
    if (isEditMode) {
      if (isPlaceholder) {
          // Add Word (Main Board)
          if (onAddWord) onAddWord(symbol.id);
      } else if (isSwapModeActive) {
         // Swap (Main Board)
         onClick(symbol); 
      } else if (canEditImage) {
         // Edit Image (Vocabulary Modal ONLY)
         fileInputRef.current?.click();
      }
      // If edit mode is on but no swap/add/image-edit handler, do nothing or select?
      // On Main Board, clicking a card in Edit Mode (without Swap active) now does NOTHING 
      // except maybe show the "Move" button. This prevents accidental edits.
    } else {
      // Normal Mode: Speak / Select
      onClick(symbol);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only used in Vocabulary Modal
    if (!onImageUpdate) return;
    
    const file = event.target.files?.[0];
    if (file) {
        // We need to dyn import or pass utility. 
        // For simplicity, let's assume the parent handles the heavy lifting 
        // OR re-implement compress here.
        // To keep this file clean, let's just do a quick read or assume utils are available.
        // Re-importing utils:
        const { compressImage } = await import('../utils/imageUtils');
        
        try {
            const compressedBase64 = await compressImage(file);
            onImageUpdate(symbol, compressedBase64);
        } catch (error) {
            console.error("Error compressing card image:", error);
            alert("Lỗi xử lý ảnh.");
        }
    }
  };

  // --- RENDER LOGIC: EMPTY ADD BUTTON (Edit Mode Only) ---
  if (isPlaceholder && isEditMode) {
      return (
        <button
            onClick={handleCardClick}
            className="w-full aspect-square md:aspect-[5/4] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all animate-pop"
        >
            <Plus size={32} />
            <span className="text-xs font-bold mt-1">Thêm</span>
        </button>
      );
  }

  return (
    <button
      onClick={handleCardClick}
      className={`
        relative group
        flex flex-col items-center justify-center
        aspect-square md:aspect-[5/4]
        w-full
        ${symbol.color}
        border-b-[3px] border-r-[3px] md:border-b-4 md:border-r-4 rounded-xl md:rounded-2xl
        active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1
        transition-all duration-100
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400
        select-none overflow-hidden
        p-1
        ${isEditMode ? 'ring-2 ring-indigo-500 border-indigo-400 border-dashed' : ''}
        ${isMoving ? 'ring-4 ring-yellow-400 border-yellow-500 bg-yellow-100 animate-pulse scale-95' : ''}
      `}
      aria-label={isEditMode ? `Chỉnh sửa ${symbol.label}` : symbol.label}
    >
      <span className="absolute -inset-1 bg-transparent pointer-events-auto z-10" />

      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {symbol.image ? (
            <img 
            src={symbol.image} 
            alt={symbol.label} 
            className="h-full w-full object-contain rounded-lg pointer-events-none p-1"
            />
        ) : (
            <span className="text-4xl md:text-5xl lg:text-6xl filter drop-shadow-sm pointer-events-none leading-none select-none transform transition-transform group-active:scale-110">
            {symbol.emoji}
            </span>
        )}
      </div>

      <div className="w-full text-center pb-1 md:pb-2">
        <span className={`
            block w-full font-bold text-slate-900 uppercase tracking-tight pointer-events-none leading-tight truncate px-1
            ${isCompact ? 'text-[10px]' : 'text-xs md:text-base lg:text-lg'}
        `}>
            {symbol.label}
        </span>
      </div>

      {/* Edit Mode Overlays */}
      {isEditMode && !isMoving && (
        <>
            {/* Visual Indicator for Image Edit - ONLY IF ENABLED (Modal) */}
            {canEditImage && !isSwapModeActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm">
                        <Camera size={24} className="text-white drop-shadow-md" />
                     </div>
                </div>
            )}
            
            {/* MOVE BUTTON (Top Left) - ONLY IF NOT EDITING IMAGE (Main Board) */}
            {onMoveStart && !isSwapModeActive && (
                <div 
                    role="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveStart(symbol);
                    }}
                    className="absolute top-1 left-1 md:top-2 md:left-2 z-50 bg-white text-slate-700 p-1.5 md:p-2 rounded-full shadow-md hover:bg-yellow-100 hover:text-yellow-600 transition-colors border border-slate-200 pointer-events-auto active:scale-95"
                    title="Sắp xếp"
                >
                    <ArrowRightLeft size={16} className="md:w-5 md:h-5" />
                </div>
            )}

            {/* RESET/DELETE BUTTON (Top Right) */}
            {/* In Modal: Reset Image. In Board: Delete Custom Word. */}
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
                        ${(isCustomFilled || (canEditImage && symbol.image)) ? 'flex' : 'hidden'} 
                        ${isCustomFilled ? 'text-red-600 hover:bg-red-100' : 'text-slate-700 hover:bg-slate-100'}
                    `}
                >
                    {isCustomFilled ? <Trash2 size={16} className="md:w-5 md:h-5" /> : <RotateCcw size={16} className="md:w-5 md:h-5" />}
                </div>
            )}

            {/* Hidden File Input (Only rendered if editing enabled) */}
            {canEditImage && (
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            )}
        </>
      )}

      {/* Select Overlay (Swapping) */}
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
