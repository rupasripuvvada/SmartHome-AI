
import React, { useMemo } from 'react';
import { InventoryItem, MealPlanDay, WasteRecord, Category } from '../types';
import { 
  AlertTriangle, 
  PackageCheck, 
  Utensils, 
  Trash2,
  Clock,
  ArrowRight,
  TrendingUp,
  Leaf
} from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  mealPlan: MealPlanDay[];
  wasteHistory: WasteRecord[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<Props> = ({ inventory, mealPlan, wasteHistory, onNavigate }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Any food item expiring within 7 days
    const expiringSoon = inventory.filter(item => {
      if (item.category === Category.WARRANTY) return false;
      const expiry = new Date(item.expiryDate);
      return expiry <= sevenDaysFromNow;
    });

    const totalWastedQty = wasteHistory.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalItems: inventory.length,
      expiringSoonCount: expiringSoon.length,
      totalWaste: totalWastedQty,
      nextMeal: mealPlan.find(d => d.date === new Date().toISOString().split('T')[0]) || mealPlan[0] || null
    };
  }, [inventory, mealPlan, wasteHistory]);

  const urgentItems = [...inventory]
    .filter(i => i.category !== Category.WARRANTY)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          icon={<PackageCheck className="text-emerald-600" />} 
          label="Total stock" 
          value={stats.totalItems} 
          color="bg-emerald-50"
          subtitle="Unique units"
          onClick={() => onNavigate('inventory')}
        />
        <StatCard 
          icon={<Clock className="text-amber-600" />} 
          label="Expiring" 
          value={stats.expiringSoonCount} 
          color="bg-amber-50"
          subtitle="Within 7 Days"
          warning={stats.expiringSoonCount > 0}
          onClick={() => onNavigate('inventory')}
        />
        <StatCard 
          icon={<Trash2 className="text-rose-600" />} 
          label="Waste" 
          value={stats.totalWaste} 
          color="bg-rose-50"
          subtitle="Total items logged"
          onClick={() => onNavigate('analytics')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 relative overflow-hidden h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3">
                <Clock size={20} className="text-indigo-600" />
                Freshness Attention
              </h3>
              <button onClick={() => onNavigate('inventory')} className="text-indigo-600 font-bold text-[9px] flex items-center gap-2 uppercase tracking-widest hover:translate-x-1 transition-transform">
                View Pantry <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-4">Product</th>
                    <th className="pb-4">Qty</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {urgentItems.length > 0 ? urgentItems.map(item => {
                    const isExpired = new Date(item.expiryDate) < new Date();
                    return (
                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 font-bold text-slate-800 text-sm truncate max-w-[150px]">{item.name}</td>
                        <td className="py-4 text-slate-500 font-bold text-xs">{item.quantity} {item.unit}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black whitespace-nowrap ${
                            isExpired 
                              ? 'bg-rose-600 text-white animate-pulse' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isExpired ? 'EXPIRED' : item.expiryDate}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-300 font-bold italic text-sm">No items needing attention!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden group h-full">
            <h3 className="text-base md:text-lg font-black mb-6 flex items-center gap-3">
              <Utensils size={20} className="text-indigo-200" />
              Chef's Pick
            </h3>
            {stats.nextMeal ? (
              <div className="space-y-6">
                <MealEntry label="Breakfast" value={stats.nextMeal.breakfast} />
                <MealEntry label="Lunch" value={stats.nextMeal.lunch} />
                <MealEntry label="Dinner" value={stats.nextMeal.dinner} />
                <button 
                  onClick={() => onNavigate('meals')}
                  className="w-full py-3.5 bg-white/20 hover:bg-white/30 rounded-xl text-[9px] font-black transition-all flex items-center justify-center gap-3 border border-white/20 uppercase tracking-widest mt-2"
                >
                  View Plan <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-indigo-100 text-xs font-bold mb-4 italic opacity-70">No plan for today.</p>
                <button onClick={() => onNavigate('meals')} className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-black shadow-lg uppercase tracking-widest hover:bg-indigo-50 transition-all text-[9px]">Generate Plan</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MealEntry = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-indigo-200 text-[8px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="font-bold text-sm leading-tight truncate">{value}</p>
  </div>
);

const StatCard = ({ icon, label, value, color, subtitle, warning, onClick }: any) => (
  <div onClick={onClick} className={`bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 border-2 ${warning ? 'border-amber-100 bg-amber-50/10' : 'border-slate-50'} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group`}>
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <h4 className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">{label}</h4>
    <p className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-slate-400 text-[8px] md:text-[9px] mt-1 font-bold truncate">{subtitle}</p>
  </div>
);

export default Dashboard;
