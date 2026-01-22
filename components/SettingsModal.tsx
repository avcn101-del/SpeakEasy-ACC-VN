
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Upload, Share2, AlertTriangle, QrCode, Copy, Check, Eye, EyeOff, Volume2, Mic2, Link, Edit2, Save, Wifi, WifiOff, PlayCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AppSettings, VoiceSettings } from '../App';
import { speak } from '../services/ttsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
  voiceSettings?: VoiceSettings;
  onUpdateVoiceSettings?: (settings: VoiceSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose,
    currentSettings = { showEditBtn: true, showAIBtn: true },
    onUpdateSettings,
    voiceSettings = { pitch: 1.0, rate: 1.0, forceOnline: false },
    onUpdateVoiceSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localVoiceSettings, setLocalVoiceSettings] = useState(voiceSettings);
  const [copied, setCopied] = useState(false);
  
  // URL Management State
  const [shareUrl, setShareUrl] = useState('https://speak-easy-acc.vercel.app');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalVoiceSettings(voiceSettings);
  }, [voiceSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const isRealUrl = (url: string) => {
            if (!url) return false;
            if (url.startsWith('blob:')) return false;
            if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168')) return false;
            if (url.includes('usercontent.goog') || url.includes('gitpod.io') || url.includes('codesandbox')) return false;
            return true;
        };

        const savedUrl = localStorage.getItem('aac-share-url');
        if (savedUrl && isRealUrl(savedUrl)) {
            setShareUrl(savedUrl);
            return;
        }

        const currentHref = window.location.href;
        if (isRealUrl(currentHref)) {
            setShareUrl(currentHref);
        }
    }
  }, []);

  const handleSaveUrl = () => {
      setIsEditingUrl(false);
      localStorage.setItem('aac-share-url', shareUrl);
  };

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    speak("Đã sao chép link", undefined, undefined, localVoiceSettings.pitch, localVoiceSettings.rate, localVoiceSettings.forceOnline);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SpeakEasy AAC',
                text: 'Ứng dụng giao tiếp hình ảnh (AAC) miễn phí, hỗ trợ tiếng Việt và AI.',
                url: shareUrl
            });
        } catch (e) { }
    } else {
        handleCopyLink();
    }
  };

  const toggleSetting = (key: keyof AppSettings) => {
      if (onUpdateSettings) {
          onUpdateSettings({
              ...currentSettings,
              [key]: !currentSettings[key]
          });
      }
  };
  
  const handleVoiceChange = (key: keyof VoiceSettings, value: any) => {
      const newSettings = { ...localVoiceSettings, [key]: value };
      setLocalVoiceSettings(newSettings);
      
      if (onUpdateVoiceSettings) {
          onUpdateVoiceSettings(newSettings);
      }
  };
  
  const handlePreviewVoice = () => {
      speak("Thử giọng nói", undefined, undefined, localVoiceSettings.pitch, localVoiceSettings.rate, localVoiceSettings.forceOnline);
  };

  const handleExport = async () => {
    try {
      const data = {
        coreVocab: JSON.parse(localStorage.getItem('aac-core-vocab') || '[]'),
        categories: JSON.parse(localStorage.getItem('aac-categories') || '[]'),
        timestamp: new Date().toISOString()
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = `aac-data-${new Date().toISOString().split('T')[0]}.json`;
      const file = new File([blob], fileName, { type: 'application/json' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Dữ liệu AAC SpeakEasy',
          text: 'Dữ liệu từ ngữ và hình ảnh tùy chỉnh của tôi.',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Không thể chia sẻ file. Vui lòng thử lại.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);

        if (!data.coreVocab || !data.categories) {
          throw new Error("File không hợp lệ");
        }

        if (confirm("CẢNH BÁO: Việc này sẽ thay thế toàn bộ từ vựng hiện tại của bạn bằng dữ liệu trong file. Bạn có chắc chắn không?")) {
          localStorage.setItem('aac-core-vocab', JSON.stringify(data.coreVocab));
          localStorage.setItem('aac-categories', JSON.stringify(data.categories));
          alert("Khôi phục thành công! Ứng dụng sẽ tải lại.");
          window.location.reload();
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("File bị lỗi hoặc không đúng định dạng.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ touchAction: 'none' }}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden flex flex-col h-[85vh] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-bold text-lg">Cài đặt</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 -mr-2">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
            className="flex-1 min-h-0 flex flex-col gap-6 p-6 overflow-y-auto overflow-x-hidden no-scrollbar pb-32"
            style={{ 
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
            }}
        >
          
          {/* SECTION: VOICE SETTINGS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
             <div className="bg-violet-50 px-4 py-3 border-b border-violet-100 flex items-center gap-2">
                <Mic2 size={18} className="text-violet-600"/>
                <span className="font-bold text-violet-900">Giọng nói</span>
             </div>
             
             <div className="p-4 flex flex-col gap-4">
                 
                 {/* Force Online Toggle - Updated UI */}
                 <div className="flex items-center justify-between pb-3 border-b border-slate-100 bg-slate-50 p-3 rounded-lg border">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {localVoiceSettings.forceOnline ? <Wifi size={18} className="text-green-600"/> : <WifiOff size={18} className="text-slate-400"/>}
                            Luôn dùng giọng Online
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">Bật nếu bị mất tiếng.</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePreviewVoice}
                            className="p-1 text-violet-600 hover:bg-violet-100 rounded-full"
                            title="Thử giọng"
                        >
                            <PlayCircle size={20} />
                        </button>
                        <button 
                            onClick={() => handleVoiceChange('forceOnline', !localVoiceSettings.forceOnline)}
                            className={`relative w-11 h-6 rounded-full p-1 transition-colors duration-200 ${localVoiceSettings.forceOnline ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${localVoiceSettings.forceOnline ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                     </div>
                 </div>

                 {/* Pitch Slider */}
                 <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Độ cao (Pitch)</span>
                        <span className="text-xs text-slate-500">{localVoiceSettings.pitch.toFixed(1)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1"
                        value={localVoiceSettings.pitch}
                        onChange={(e) => handleVoiceChange('pitch', parseFloat(e.target.value))}
                        onPointerUp={handlePreviewVoice}
                        style={{ touchAction: 'none' }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <div className="flex justify-between mt-1 px-1">
                        <span className="text-[10px] text-slate-400">Trầm</span>
                        <span className="text-[10px] text-slate-400">Cao</span>
                    </div>
                 </div>

                 {/* Rate Slider */}
                 <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Tốc độ</span>
                        <span className="text-xs text-slate-500">{localVoiceSettings.rate.toFixed(1)}x</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1"
                        value={localVoiceSettings.rate}
                        onChange={(e) => handleVoiceChange('rate', parseFloat(e.target.value))}
                        onPointerUp={handlePreviewVoice}
                        style={{ touchAction: 'none' }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                 </div>
             </div>
          </div>

          {/* SECTION: INTERFACE */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Eye size={18} className="text-slate-600"/>
                <span className="font-bold text-slate-900">Giao diện (Chế độ trẻ em)</span>
             </div>
             
             <div className="p-4 flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-700">Hiển thị nút "Sửa" (✏️)</span>
                     <button 
                        onClick={() => toggleSetting('showEditBtn')}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${currentSettings.showEditBtn ? 'bg-green-500' : 'bg-slate-300'}`}
                     >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${currentSettings.showEditBtn ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                 </div>

                 <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-700">Hiển thị nút "Đoán từ AI" (✨)</span>
                     <button 
                        onClick={() => toggleSetting('showAIBtn')}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${currentSettings.showAIBtn ? 'bg-green-500' : 'bg-slate-300'}`}
                     >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${currentSettings.showAIBtn ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                 </div>
                 <p className="text-xs text-slate-400 mt-1">Tắt các nút này để trẻ không vô tình chỉnh sửa thẻ.</p>
             </div>
          </div>


          {/* SECTION: DATA BACKUP */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <button 
              onClick={handleExport}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all active:scale-95 group"
            >
              <div className="bg-white p-2 rounded-full shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <span className="font-bold text-emerald-800 text-sm">Sao lưu</span>
            </button>

            <button 
              onClick={handleImportClick}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl transition-all active:scale-95 group"
            >
              <div className="bg-white p-2 rounded-full shadow-sm text-orange-600 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <span className="font-bold text-orange-800 text-sm">Khôi phục</span>
            </button>
          </div>
          
           {/* SECTION: SHARE APP */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
             <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                <Share2 size={18} className="text-indigo-600"/>
                <span className="font-bold text-indigo-900">Chia sẻ Ứng dụng</span>
             </div>
             
             <div className="p-4 flex flex-col items-center">
                 <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-100 mb-4 w-full flex justify-center bg-slate-50">
                     <QRCode 
                        value={shareUrl} 
                        size={120} 
                        style={{ height: "auto", maxWidth: "160px", width: "100%" }} 
                        viewBox={`0 0 256 256`} 
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="L"
                     />
                 </div>
                 
                 <div className="w-full flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                     {isEditingUrl ? (
                         <>
                             <input 
                                type="text" 
                                value={shareUrl} 
                                onChange={(e) => setShareUrl(e.target.value)}
                                className="flex-1 text-sm bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                             />
                             <button onClick={handleSaveUrl} className="p-2 text-green-600 hover:bg-green-100 rounded">
                                 <Save size={18} />
                             </button>
                         </>
                     ) : (
                         <>
                            <div className="flex-1 text-xs text-slate-500 font-mono break-all truncate">
                                {shareUrl}
                            </div>
                            <button onClick={() => setIsEditingUrl(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                <Edit2 size={16} />
                            </button>
                         </>
                     )}
                 </div>

                 <div className="grid grid-cols-2 gap-2 w-full">
                    <button 
                        onClick={handleCopyLink}
                        className={`
                            py-2.5 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm border
                            ${copied 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }
                        `}
                    >
                        {copied ? <Check size={16} /> : <Link size={16} />}
                        {copied ? 'Đã chép' : 'Copy Link'}
                    </button>

                    <button 
                        onClick={handleShareLink}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-200 active:scale-95"
                    >
                        <Share2 size={16} />
                        Gửi
                    </button>
                 </div>
             </div>
          </div>

          <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange}
            />

        </div>
      </div>
    </div>
  );
};
