
import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';
import { Search, Plus, Minus, Trash2, Check, Trash, X, PackageCheck, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onRemove: (id: string, wasWasted: boolean) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
  onFixExpiries?: () => void;
}

const Inventory: React.FC<Props> = ({ inventory, onRemove, onUpdateQty, onAdd, onFixExpiries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search pantry..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={onFixExpiries}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 shrink-0"
          >
            <Sparkles size={14} /> Fix Dates
          </button>
          <select 
            className="appearance-none flex-1 md:w-40 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-bold text-slate-600 text-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredItems.map(item => {
          const hasExpiry = item.category !== Category.WARRANTY;
          const isExpired = hasExpiry && new Date(item.expiryDate) < new Date();
          
          return (
            <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                isExpired ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 pr-2">
                  <span className="text-[8px] uppercase tracking-widest font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full inline-block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-2 truncate">{item.name}</h3>
                </div>
                <button 
                  onClick={() => setRemovingId(item.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl flex-1">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg text-slate-500"><Minus size={14} /></button>
                  <span className="font-bold text-slate-800 flex-1 text-center text-xs truncate">{item.quantity} {item.unit}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg text-slate-500"><Plus size={14} /></button>
                </div>
                {hasExpiry && (
                  <div className="text-right shrink-0">
                    <p className="text-[8px] text-slate-400 font-black uppercase">Expiry</p>
                    <p className={`font-bold text-[11px] ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>{item.expiryDate}</p>
                  </div>
                )}
              </div>

              {item.quantity <= item.minStockLevel && (
                <div className="bg-amber-50 text-amber-700 text-[9px] py-2 px-3 rounded-lg flex items-center gap-2 font-black uppercase">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                  Low Stock
                </div>
              )}

              {removingId === item.id && (
                <div className="absolute inset-0 bg-white/98 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-150">
                  <h4 className="text-sm font-black text-slate-800 mb-1">Remove Item?</h4>
                  <p className="text-[10px] text-slate-400 text-center mb-4">Did you use it or waste it?</p>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => { onRemove(item.id, false); setRemovingId(null); }}
                      className="flex-1 bg-emerald-600 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide"
                    >
                      Used
                    </button>
                    <button 
                      onClick={() => { onRemove(item.id, true); setRemovingId(null); }}
                      className="flex-1 bg-rose-600 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide"
                    >
                      Wasted
                    </button>
                  </div>
                  <button onClick={() => setRemovingId(null)} className="mt-3 text-slate-400 font-black text-[9px] uppercase hover:text-slate-600">Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <PackageCheck size={48} className="text-slate-100 mb-4" />
          <h3 className="text-slate-800 font-black text-lg">Pantry is empty</h3>
          <p className="text-slate-400 text-xs text-center mt-1">Stock up with the AI Scanner!</p>
        </div>
      )}

      {isAdding && (
        <AddItemModal onClose={() => setIsAdding(false)} onSubmit={(item: any) => { onAdd(item); setIsAdding(false); }} />
      )}
    </div>
  );
};

const AddItemModal = ({ onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    category: Category.OTHER,
    quantity: 1,
    unit: 'pcs',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minStockLevel: 2
  });

  const [errors, setErrors] = useState<{name?: boolean, quantity?: boolean}>({});

  const handleSubmit = () => {
    const newErrors: {name?: boolean, quantity?: boolean} = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (formData.quantity <= 0) newErrors.quantity = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({
      name: '',
      category: Category.OTHER,
      quantity: 1,
      unit: 'pcs',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minStockLevel: 2
    });
    setErrors({});
  };

  const hasExpiryField = formData.category !== Category.WARRANTY;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-base font-black text-slate-800">New Item</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400">Name</label>
            <input 
              type="text" 
              className={`w-full px-4 py-2.5 bg-slate-50 rounded-xl outline-none font-bold text-sm border-2 transition-all ${errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent focus:ring-2 focus:ring-indigo-500'}`} 
              value={formData.name} 
              onChange={(e) => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: false});
              }} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Category</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})}>
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {hasExpiryField && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Expiry Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Quantity</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-xl outline-none font-bold text-xs border-2 transition-all ${errors.quantity ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent focus:ring-2 focus:ring-indigo-500'}`} 
                value={formData.quantity} 
                onChange={(e) => {
                  setFormData({...formData, quantity: Number(e.target.value)});
                  if (errors.quantity) setErrors({...errors, quantity: false});
                }} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Unit</label>
              <input type="text" placeholder="pcs, kg..." className="w-full px-4 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
            </div>
          </div>
        </div>
        <div className="p-5 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold text-xs">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg">Save Item</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
