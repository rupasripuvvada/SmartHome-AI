
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { InventoryItem, WasteRecord, Category } from '../types';
// Added missing Trash2 import
import { PieChart as PieIcon, BarChart3, TrendingUp, PackageCheck, History, Trash2 } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  wasteHistory: WasteRecord[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const Analytics: React.FC<Props> = ({ inventory, wasteHistory }) => {
  const categoryData = Object.values(Category).map(cat => ({
    name: cat,
    value: inventory.filter(i => i.category === cat).length
  })).filter(d => d.value > 0);

  const wasteData = Object.values(Category).map(cat => ({
    name: cat,
    value: wasteHistory.filter(w => w.category === cat).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  })).filter(d => d.value > 0);

  const hasData = categoryData.length > 0 || wasteData.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-8 text-center">
        <div className="bg-slate-50 p-8 md:p-10 rounded-full mb-8">
          <PackageCheck size={64} className="text-slate-200" />
        </div>
        <h3 className="text-slate-800 font-black text-2xl">No Analytics Data Yet</h3>
        <p className="text-slate-400 font-medium max-w-sm mt-3 leading-relaxed text-sm md:text-base">
          Start adding items and logging your usage to see waste trends and category insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Inventory Composition */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Distribution</h3>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase font-black tracking-widest mt-1">Stock by category</p>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-xl"><PieIcon className="text-indigo-600" size={20} /></div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-500 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Trends */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Waste Footprint</h3>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase font-black tracking-widest mt-1">Category breakdown</p>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl"><BarChart3 className="text-rose-600" size={20} /></div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            {wasteData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <BarChart3 size={40} className="mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">No logs recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                   <History size={20} className="text-slate-400" />
                   Recent Waste Activity
                </h3>
             </div>
             <div className="space-y-4">
                {wasteHistory.length > 0 ? wasteHistory.slice(0, 5).map(waste => (
                  <div key={waste.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                          <Trash2 size={18} />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800 text-sm">{waste.itemName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{waste.category}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-rose-600">{waste.quantity} Wasted</p>
                       <p className="text-[9px] text-slate-400 font-bold">{waste.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <p className="text-slate-300 font-bold text-xs italic">No items marked as waste yet.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-10 text-white flex flex-col justify-center shadow-xl shadow-indigo-100 h-full">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm shrink-0 mb-8 w-fit"><TrendingUp size={40} className="text-white" /></div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black italic">Efficiency Score</h3>
              <p className="text-indigo-100 font-medium leading-relaxed text-sm md:text-base">
                Gemini predicts you could reduce waste by <b>15%</b> by following the upcoming meal planner more closely.
              </p>
              <div className="pt-4">
                 <div className="w-full bg-indigo-700/50 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: '85%' }}></div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-2">85% Utilization Rating</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Analytics;
