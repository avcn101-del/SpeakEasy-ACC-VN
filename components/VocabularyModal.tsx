
import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Edit3 } from 'lucide-react';
import { AACSymbol } from '../types';
import { FRINGE_VOCAB } from '../data/fringeVocab';
import { AACCard } from './AACCard';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: AACSymbol) => void;
  isEditMode: boolean;
  coreVocab: AACSymbol[]; // Received from App
  customImages: Record<string, string>;
  onUpdateImage: (id: string, base64: string) => void; // Unified handler
  onResetImage: (id: string) => void; // Unified handler
}

// Category Mapping
const CATEGORIES = [
  { id: 'all', label: 'Tất cả', prefix: '' },
  { id: 'core', label: 'Cốt lõi', prefix: 'CORE' }, // Special ID for logic
  { id: 'food', label: 'Đồ ăn', prefix: 'f_' },
  { id: 'toy', label: 'Đồ chơi', prefix: 't_' },
  { id: 'place', label: 'Địa điểm', prefix: 'p_' },
  { id: 'action', label: 'Hành động', prefix: 'v_' },
  { id: 'adj', label: 'Mô tả', prefix: 'adj_' },
  { id: 'animal', label: 'Động vật', prefix: 'an_' },
  { id: 'body', label: 'Cơ thể', prefix: 'b_' },
  { id: 'clothes', label: 'Quần áo', prefix: 'c_' },
];

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  isEditMode,
  coreVocab,
  customImages,
  onUpdateImage,
  onResetImage
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // 1. Merge Core + Fringe into one list
  const allSymbols = useMemo(() => {
    // Filter out placeholders from Core for the library view
    const validCore = coreVocab.filter(s => s.color !== 'placeholder' && s.label !== '');
    
    // Combine lists
    // Note: Core symbols in `coreVocab` might already have images inside them (stored in state).
    // Fringe symbols need to check the `customImages` map.
    
    const hydratedFringe = FRINGE_VOCAB.map(sym => ({
      ...sym,
      image: customImages[sym.id] || sym.image
    }));

    // For Core, we use the object as-is (images are inside), but we ensure consistency
    // We add a 'source' tag conceptually if needed, but ID checks are enough.
    return [...validCore, ...hydratedFringe];
  }, [coreVocab, customImages]);

  // 2. Filter Logic
  const filteredSymbols = useMemo(() => {
    return allSymbols.filter(sym => {
      const matchesSearch = sym.label.toLowerCase().includes(search.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory !== 'all') {
        if (activeCategory === 'core') {
            // Check if it exists in the coreVocab list by ID
            matchesCategory = coreVocab.some(c => c.id === sym.id);
        } else if (activeCategory === 'place') {
             matchesCategory = sym.id.startsWith('p_') || sym.id.startsWith('pp_');
        } else {
            const prefix = CATEGORIES.find(c => c.id === activeCategory)?.prefix;
            if (prefix) {
                matchesCategory = sym.id.startsWith(prefix);
            }
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, allSymbols, coreVocab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0 safe-top">
        <div className="flex items-center gap-2 text-indigo-700">
            <BookOpen size={24} />
            <h2 className="font-bold text-lg md:text-xl">Kho Từ Vựng ({allSymbols.length})</h2>
        </div>
        <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600"
        >
            <X size={24} />
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 space-y-3">
         {/* Search Bar */}
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         {/* Categories Scroll */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                        whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors
                        ${activeCategory === cat.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                >
                    {cat.label}
                </button>
            ))}
         </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
         {isEditMode && (
             <div className="mb-4 bg-indigo-50 border border-indigo-200 p-3 rounded-lg flex items-center gap-3 text-indigo-800 text-sm">
                 <Edit3 size={20} />
                 <span>Bạn đang ở chế độ chỉnh sửa. Nhấn vào thẻ để thay đổi ảnh.</span>
             </div>
         )}

         {filteredSymbols.length === 0 ? (
             <div className="text-center text-slate-400 mt-20">
                 Không tìm thấy từ nào.
             </div>
         ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pb-20">
                {filteredSymbols.map(symbol => (
                    <AACCard 
                        key={symbol.id}
                        symbol={symbol}
                        onClick={() => {
                            if (!isEditMode) {
                                onSelectSymbol(symbol);
                                // We generally keep the modal open to allow building sentences, 
                                // or close it if you prefer single selection. 
                                // Let's keep it open but provide feedback.
                            }
                        }}
                        // Crucially, we PASS image update props here, but only here.
                        isEditMode={isEditMode}
                        onImageUpdate={(s, b64) => onUpdateImage(s.id, b64)}
                        onImageReset={(s) => onResetImage(s.id)}
                    />
                ))}
            </div>
         )}
      </div>

    </div>
  );
};
