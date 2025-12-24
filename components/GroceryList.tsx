
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Download, CheckCircle2, AlertCircle, Trash2, Plus, X, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types';

interface GroceryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  reason: string;
}

interface Props {
  inventory: InventoryItem[];
  savedList: GroceryItem[];
  onUpdateList: (list: GroceryItem[]) => void;
}

const GroceryList: React.FC<Props> = ({ inventory, savedList, onUpdateList }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<{name?: boolean, qty?: boolean}>({});

  const autoSuggestions = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const lowStock = inventory.filter(item => {
      const minStock = item.minStockLevel || 2;
      return item.quantity <= minStock;
    });

    const expired = inventory.filter(item => {
      const expiry = new Date(item.expiryDate);
      return expiry < today;
    });
    
    const suggested: GroceryItem[] = [];
    const names = new Set([...lowStock.map(i => i.name), ...expired.map(i => i.name)]);
    
    names.forEach(name => {
      if (!savedList.some(li => li.name.toLowerCase() === name.toLowerCase())) {
        const inv = inventory.find(i => i.name === name);
        const isExpired = expired.some(i => i.name === name);
        suggested.push({
          id: `suggest_${name.replace(/\s+/g, '_')}_${Date.now()}`,
          name,
          qty: inv?.minStockLevel || 2,
          unit: inv?.unit || 'pcs',
          reason: isExpired ? 'Auto: Expired' : 'Auto: Low Stock'
        });
      }
    });
    return suggested;
  }, [inventory, savedList]);

  const addItem = (item: Omit<GroceryItem, 'id'>) => {
    const currentErrors: any = {};
    if (!item.name.trim()) currentErrors.name = true;
    if (item.qty <= 0) currentErrors.qty = true;

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    const newList = [{ ...item, id: Math.random().toString(36).substring(2, 11) }, ...savedList];
    onUpdateList(newList);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemUnit('pcs');
    setErrors({});
    setIsAdding(false);
  };

  const removeItem = (id: string) => {
    onUpdateList(savedList.filter(i => i.id !== id));
  };

  const downloadList = () => {
    const content = savedList.map(i => `${i.name}: ${i.qty} ${i.unit} (${i.reason})`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 md:gap-8">
          <div className="bg-white/20 p-4 md:p-5 rounded-3xl backdrop-blur-md">
            <ShoppingCart size={40} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black">Shopping List</h2>
            <p className="text-indigo-100 font-bold mt-2 text-sm md:text-base">Smart suggestions based on your fridge stock.</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none bg-white text-indigo-700 px-6 md:px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-50 shadow-lg active:scale-95 transition-all text-xs"
          >
            <Plus size={18} /> Add Item
          </button>
          <button 
            onClick={downloadList}
            disabled={savedList.length === 0}
            className="flex-1 md:flex-none bg-indigo-500 text-white px-6 md:px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-400 disabled:opacity-50 transition-all text-xs"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800">Pantry Replenishment</h3>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{savedList.length} Items</span>
            </div>
            
            <div className="divide-y divide-slate-50">
              {savedList.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-8 h-8 rounded-xl border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-600 group-hover:bg-white transition-all">
                      <div className="w-4 h-4 rounded-lg bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.qty} {item.unit}</span>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                          item.reason.includes('Auto') ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.reason}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              {savedList.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="bg-emerald-50 p-6 rounded-full mb-2">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <p className="font-black text-slate-800 text-xl">Stock is Healthy!</p>
                  <p className="text-slate-400 font-medium max-w-xs text-sm">Your list is clear. Use AI suggestions to auto-populate missing items.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 p-2 rounded-xl">
                <Sparkles size={20} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Smart Recs</h3>
            </div>
            <div className="space-y-4">
              {autoSuggestions.map(suggest => (
                <div key={suggest.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 pr-4">
                      <p className="font-black text-slate-800 truncate text-sm">{suggest.name}</p>
                      <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest mt-0.5">{suggest.reason}</p>
                    </div>
                    <button 
                      onClick={() => addItem({...suggest, reason: suggest.reason})}
                      className="shrink-0 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
                      title="Add to list"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {autoSuggestions.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">No Suggestions</p>
                  <p className="text-slate-400 text-[11px] mt-1">Inventory levels look great!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-200">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">New Item</h3>
                <button onClick={() => { setIsAdding(false); setErrors({}); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X /></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Item Name</label>
                   <input 
                    type="text" 
                    className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border ${errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-100'} outline-none font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all`} 
                    placeholder="e.g. Avocado"
                    value={newItemName}
                    onChange={e => {
                      setNewItemName(e.target.value);
                      if (errors.name) setErrors({...errors, name: false});
                    }}
                   />
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qty</label>
                      <input 
                        type="number" 
                        className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border ${errors.qty ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-100'} outline-none font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all`}
                        value={newItemQty}
                        onChange={e => {
                          setNewItemQty(Number(e.target.value));
                          if (errors.qty) setErrors({...errors, qty: false});
                        }}
                      />
                   </div>
                   <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unit</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={newItemUnit}
                        onChange={e => setNewItemUnit(e.target.value)}
                        placeholder="pcs"
                      />
                   </div>
                </div>
                <button 
                  onClick={() => addItem({name: newItemName, qty: newItemQty, unit: newItemUnit, reason: 'Manual Entry'})}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all hover:bg-indigo-700 mt-2"
                >
                  Save to Shopping List
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryList;
