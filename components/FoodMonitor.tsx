
import React, { useState } from 'react';
import { IdentifiedFood } from '../types';
import { Trash2, Clock, Flame, ChevronRight, X, Info } from 'lucide-react';

interface Props {
  foods: IdentifiedFood[];
  onRemove: (id: string) => void;
}

const FoodMonitor: React.FC<Props> = ({ foods, onRemove }) => {
  const [selected, setSelected] = useState<IdentifiedFood | null>(null);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map(food => {
          const isExpiring = new Date(food.expiryDate).getTime() < Date.now() + (1000 * 3600 * 24 * 2);
          return (
            <div 
              key={food.id} 
              onClick={() => setSelected(food)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${isExpiring ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                  <Flame size={20} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); onRemove(food.id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1 truncate">{food.name}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Identified: {new Date(food.identifiedAt).toLocaleDateString()}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-2 ${isExpiring ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Clock size={12} /> {food.expiryDate}
                </div>
                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </div>
          );
        })}

        {foods.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Flame size={48} className="text-slate-100 mb-4" />
            <h3 className="text-slate-800 font-black">Food Lab is empty</h3>
            <p className="text-slate-400 text-xs mt-1">Use the AI Scanner to identify dishes and monitor freshness.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg"><Flame size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selected.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Intelligent Identification</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><Info size={14} /> Detected Ingredients</label>
                <div className="flex flex-wrap gap-2">
                  {selected.ingredients.map((ing, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm">{ing}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Freshness Logic</label>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  {selected.freshnessNotes}
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safe Expiry</p>
                  <p className="text-xl font-black text-rose-600">{selected.expiryDate}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified On</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(selected.identifiedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end">
              <button onClick={() => setSelected(null)} className="px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Close Lab</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMonitor;
