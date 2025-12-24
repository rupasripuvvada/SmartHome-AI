
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Trash2, X, ShieldCheck, Flame, Info } from 'lucide-react';
import { parseReceiptOCR, detectFoodAndExpiry, parseWarrantyOCR } from '../services/geminiService';
import { InventoryItem, Category, IdentifiedFood, WarrantyAsset } from '../types';

interface Props {
  onItemsFound: (items: Partial<InventoryItem>[]) => void;
  onFoodFound: (food: Omit<IdentifiedFood, 'id' | 'identifiedAt'>) => void;
  onAssetFound: (asset: Omit<WarrantyAsset, 'id'>) => void;
}

const OCRScanner: React.FC<Props> = ({ onItemsFound, onFoodFound, onAssetFound }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'receipt' | 'food' | 'warranty'>('receipt');
  
  const [pendingInventory, setPendingInventory] = useState<Partial<InventoryItem>[]>([]);
  const [pendingFood, setPendingFood] = useState<Partial<IdentifiedFood> | null>(null);
  const [pendingAsset, setPendingAsset] = useState<Partial<WarrantyAsset> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        if (mode === 'receipt') {
          const results = await parseReceiptOCR(base64);
          if (results.length > 0) setPendingInventory(results);
          else setError("No items detected in receipt.");
        } else if (mode === 'warranty') {
          const result = await parseWarrantyOCR(base64);
          if (result.productName) setPendingAsset(result);
          else setError("No warranty details found.");
        } else {
          const result = await detectFoodAndExpiry(base64);
          if (result.name) setPendingFood(result);
          else setError("Food not identified.");
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("AI analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const reset = () => {
    setPendingInventory([]);
    setPendingFood(null);
    setPendingAsset(null);
  };

  const commit = () => {
    if (mode === 'receipt') onItemsFound(pendingInventory);
    if (mode === 'food' && pendingFood) onFoodFound(pendingFood as any);
    if (mode === 'warranty' && pendingAsset) onAssetFound(pendingAsset as any);
    reset();
  };

  if (pendingInventory.length > 0 || pendingFood || pendingAsset) {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xl space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800">Review AI Findings</h2>
              <p className="text-slate-400 text-xs md:text-sm">Verify and refine the extracted information.</p>
            </div>
            <button onClick={reset} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-2xl"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {mode === 'receipt' && pendingInventory.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-center">
                <div className="flex-1">
                  <input className="w-full bg-white px-4 py-2 rounded-xl text-sm font-bold border-none outline-none" value={item.name} onChange={e => {
                    const next = [...pendingInventory];
                    next[idx].name = e.target.value;
                    setPendingInventory(next);
                  }} />
                </div>
                <div className="w-24">
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{item.category}</span>
                </div>
              </div>
            ))}

            {mode === 'food' && pendingFood && (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Identified Dish</label>
                  <input className="text-2xl font-black text-emerald-900 bg-transparent border-none outline-none w-full" value={pendingFood.name} onChange={e => setPendingFood({...pendingFood, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Ingredients</label>
                    <div className="flex flex-wrap gap-2">
                      {pendingFood.ingredients?.map((ing, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600">{ing}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Freshness Note</label>
                      <p className="text-xs font-medium text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">{pendingFood.freshnessNotes}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Expiry Prediction</label>
                      <input type="date" className="w-full mt-1 bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm" value={pendingFood.expiryDate} onChange={e => setPendingFood({...pendingFood, expiryDate: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === 'warranty' && pendingAsset && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                      <input className="w-full bg-white p-3 rounded-xl font-black text-slate-800 outline-none mt-1" value={pendingAsset.productName} onChange={e => setPendingAsset({...pendingAsset, productName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</label>
                      <input className="w-full bg-white p-3 rounded-xl font-bold text-indigo-600 outline-none mt-1" value={pendingAsset.brand} onChange={e => setPendingAsset({...pendingAsset, brand: e.target.value})} />
                    </div>
                  </div>
                  <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Model Number</label>
                      <input className="w-full bg-white p-3 rounded-xl font-bold text-slate-600 outline-none mt-1" value={pendingAsset.modelNumber || ''} onChange={e => setPendingAsset({...pendingAsset, modelNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Coverage Expiry</label>
                      <input type="date" className="w-full bg-white p-3 rounded-xl font-bold text-rose-600 outline-none mt-1" value={pendingAsset.expiryDate} onChange={e => setPendingAsset({...pendingAsset, expiryDate: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={commit} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all">
            <CheckCircle2 size={24} /> 
            {mode === 'receipt' ? 'Add to Pantry Inventory' : mode === 'food' ? 'Save to Freshness Lab' : 'Secure in Asset Vault'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">AI Intelligence Engine</h2>
        <p className="text-slate-400 text-sm md:text-base font-medium mt-1">Select a mode to extract and monitor kitchen assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <ModeCard active={mode === 'receipt'} onClick={() => setMode('receipt')} icon={<Upload size={24} />} label="Receipt Scan" desc="Stock your pantry bulk items." />
        <ModeCard active={mode === 'food'} onClick={() => setMode('food')} icon={<Flame size={24} className="text-emerald-500" />} label="Food Identification" desc="Extract ingredients & shelf-life." />
        <ModeCard active={mode === 'warranty'} onClick={() => setMode('warranty')} icon={<ShieldCheck size={24} className="text-indigo-500" />} label="Asset Vault" desc="Track warranty card coverage." />
      </div>

      <div className="bg-white rounded-3xl p-10 md:p-20 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors"></div>
        
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-indigo-600 font-black animate-pulse">Gemini AI is processing your {mode}...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Camera size={32} className="text-slate-300" />
            </div>
            <div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => e.target.files?.[0] && processImage(e.target.files[0])} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 shadow-2xl transition-all active:scale-95"
              >
                Upload Photo for Analysis
              </button>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Info size={14} /> Supports JPG, PNG, WEBP
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 flex items-center gap-3 bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span className="font-bold text-xs">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ModeCard = ({ active, onClick, icon, label, desc }: any) => (
  <div onClick={onClick} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer bg-white group ${active ? 'border-indigo-600 shadow-xl' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:scale-110'}`}>
      {icon}
    </div>
    <h3 className="text-base font-black text-slate-800 mb-1">{label}</h3>
    <p className="text-slate-400 text-xs font-medium leading-relaxed">{desc}</p>
  </div>
);

export default OCRScanner;
