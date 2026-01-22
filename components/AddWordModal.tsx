
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, image: string | null) => void;
  categoryLabel: string;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({ isOpen, onClose, onSave, categoryLabel }) => {
  const [label, setLabel] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressedBase64 = await compressImage(file);
        setPreview(compressedBase64);
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Không thể xử lý ảnh này. Vui lòng thử ảnh khác.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave(label, preview);
    setLabel('');
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Thêm từ mới vào "{categoryLabel}"</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          {/* Label Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tên thẻ (Tiếng Việt)</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ví dụ: Bánh quy"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-lg"
              autoFocus
            />
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh</label>
            <div 
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`
                relative w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
                ${isProcessing ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  {isProcessing ? (
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2 mx-auto"></div>
                  ) : (
                    <div className="flex justify-center mb-2 gap-2">
                        <Camera size={24} />
                        <ImageIcon size={24} />
                    </div>
                  )}
                  <span className="text-sm font-medium">{isProcessing ? "Đang xử lý..." : "Chạm để chọn ảnh"}</span>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={!label.trim() || isProcessing}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              Lưu Thẻ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
