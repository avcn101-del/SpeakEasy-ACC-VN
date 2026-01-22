
import { AACSymbol, WordType, Category } from './types';

// GRID LAYOUT: 8 Columns
// COLS 1-4: Subject (Yellow) | Action (Green) | Action (Green) | Internal State (Blue)
// COL 5:    Spacer (Gap) -> NOW EDITABLE CUSTOM SLOTS
// COLS 6-8: Needs (White) | Social/Confirm (White/Red) | Questions (Purple)

export const CORE_VOCAB: AACSymbol[] = [
  // --- ROW 1 ---
  { id: 'i', label: 'Con', emoji: '🧒', color: 'bg-yellow-200 border-yellow-400', type: WordType.PRONOUN },
  { id: 'want', label: 'Muốn', emoji: '🤲', color: 'bg-green-200 border-green-400', type: WordType.VERB }, 
  { id: 'eat', label: 'Ăn', emoji: '🥄', color: 'bg-green-200 border-green-400', type: WordType.VERB }, 
  { id: 'scared', label: 'Sợ', emoji: '😱', color: 'bg-blue-200 border-blue-400', type: WordType.ADJECTIVE },
  { id: 'sp1', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 1
  { id: 'toilet', label: 'Vệ sinh', emoji: '🚽', color: 'bg-white border-slate-300', type: WordType.NOUN },
  { id: 'yes', label: 'Có', emoji: '👍', color: 'bg-white border-slate-300', type: WordType.SOCIAL }, 
  { id: 'what', label: 'Cái gì?', emoji: '❓', color: 'bg-purple-200 border-purple-400', type: WordType.QUESTION },

  // --- ROW 2 ---
  { id: 'mom', label: 'Mẹ', emoji: '👩', color: 'bg-yellow-200 border-yellow-400', type: WordType.PRONOUN },
  { id: 'watch', label: 'Xem', emoji: '👀', color: 'bg-green-200 border-green-400', type: WordType.VERB },
  { id: 'drink', label: 'Uống', emoji: '🥛', color: 'bg-green-200 border-green-400', type: WordType.VERB }, 
  { id: 'tired', label: 'Mệt', emoji: '😫', color: 'bg-blue-200 border-blue-400', type: WordType.ADJECTIVE },
  { id: 'sp2', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 2
  { id: 'bath', label: 'Tắm', emoji: '🛁', color: 'bg-white border-slate-300', type: WordType.NOUN },
  { id: 'no', label: 'Không', emoji: '👎', color: 'bg-white border-slate-300', type: WordType.SOCIAL }, 
  { id: 'where', label: 'Ở đâu?', emoji: '🗺️', color: 'bg-purple-200 border-purple-400', type: WordType.QUESTION },

  // --- ROW 3 ---
  { id: 'dad', label: 'Ba', emoji: '👨', color: 'bg-yellow-200 border-yellow-400', type: WordType.PRONOUN },
  { id: 'get', label: 'Lấy', emoji: '✊', color: 'bg-green-200 border-green-400', type: WordType.VERB },
  { id: 'sleep', label: 'Ngủ', emoji: '🛌', color: 'bg-green-200 border-green-400', type: WordType.VERB }, 
  { id: 'happy', label: 'Vui', emoji: '😄', color: 'bg-blue-200 border-blue-400', type: WordType.ADJECTIVE },
  { id: 'sp3', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 3
  { id: 'wash', label: 'Rửa tay', emoji: '👐', color: 'bg-white border-slate-300', type: WordType.NOUN },
  { id: 'stop', label: 'Dừng', emoji: '✋', color: 'bg-red-200 border-red-400', type: WordType.SOCIAL }, 
  { id: 'sp4', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 4

  // --- ROW 4 ---
  { id: 'grandpa', label: 'Ông', emoji: '👴', color: 'bg-yellow-200 border-yellow-400', type: WordType.PRONOUN },
  { id: 'go', label: 'Đi', emoji: '🚶', color: 'bg-green-200 border-green-400', type: WordType.VERB },
  { id: 'play', label: 'Chơi', emoji: '🪀', color: 'bg-green-200 border-green-400', type: WordType.VERB },
  { id: 'sad', label: 'Buồn', emoji: '😢', color: 'bg-blue-200 border-blue-400', type: WordType.ADJECTIVE },
  { id: 'sp5', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 5
  { id: 'clothes', label: 'Quần áo', emoji: '👕', color: 'bg-white border-slate-300', type: WordType.NOUN },
  { id: 'sp6', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 6
  { id: 'sp7', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 7

  // --- ROW 5 ---
  { id: 'grandma', label: 'Bà', emoji: '👵', color: 'bg-yellow-200 border-yellow-400', type: WordType.PRONOUN },
  { id: 'help', label: 'Giúp', emoji: '🤝', color: 'bg-green-200 border-green-400', type: WordType.VERB },
  { id: 'sp8', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 8
  { id: 'hurt', label: 'Đau', emoji: '🤕', color: 'bg-blue-200 border-blue-400', type: WordType.ADJECTIVE }, 
  { id: 'sp9', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 9
  { id: 'sp10', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 10
  { id: 'sp11', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 11
  { id: 'sp12', label: '', emoji: '', color: 'placeholder', type: WordType.NOUN }, // CUSTOM SLOT 12
];

export const CATEGORIES: Category[] = [];
