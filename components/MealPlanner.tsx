
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Loader2, Sparkles, RefreshCw, X, Clock, ChefHat, CheckCircle2, AlertCircle } from 'lucide-react';
import { InventoryItem, FamilyProfile, MealPlanDay, Recipe } from '../types';
import { generateMealPlan, getRecipeForMeal } from '../services/geminiService';

interface Props {
  inventory: InventoryItem[];
  profile: FamilyProfile;
  currentPlan: MealPlanDay[];
  onUpdatePlan: (plan: MealPlanDay[]) => void;
  onCook: (recipe: Recipe) => void;
}

const MealPlanner: React.FC<Props> = ({ inventory, profile, currentPlan, onUpdatePlan, onCook }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingRecipe, setFetchingRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const results = await generateMealPlan(inventory, profile, today);
      onUpdatePlan(results);
    } catch (err) {
      console.error("Meal Plan Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMealClick = async (mealTitle: string) => {
    if (!mealTitle || mealTitle.toLowerCase().includes('none')) return;
    setFetchingRecipe(true);
    try {
      const recipe = await getRecipeForMeal(mealTitle, inventory, profile);
      setSelectedRecipe(recipe);
    } catch (err) {
      console.error("Recipe Fetch Error:", err);
    } finally {
      setFetchingRecipe(false);
    }
  };

  const checkInStock = (ingredientName: string) => {
    return inventory.some(item => 
      item.name.toLowerCase().includes(ingredientName.toLowerCase()) || 
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3">
            Weekly Meal Planner
            <Sparkles className="text-amber-400" size={24} />
          </h2>
          <p className="text-slate-500 font-medium text-sm">AI uses ONLY present inventory to suggest meals. Click to cook!</p>
        </div>
        <button 
          onClick={handleGeneratePlan}
          disabled={loading || inventory.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          {loading ? 'AI is Checking Fridge...' : 'Plan with Current Stock'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {currentPlan && currentPlan.length > 0 ? currentPlan.map((day, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-indigo-100 group transition-all">
            <div className="w-full md:w-56 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r group-hover:bg-indigo-50 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">{day.dayName}</span>
              <span className="text-2xl font-black text-slate-800">{formatDateLabel(day.date)}</span>
              <div className="mt-4 w-12 h-1 bg-indigo-100 rounded-full group-hover:bg-indigo-400"></div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <MealSlot label="Breakfast" value={day.breakfast} icon="🍳" onClick={() => handleMealClick(day.breakfast)} />
              <MealSlot label="Lunch" value={day.lunch} icon="🥗" onClick={() => handleMealClick(day.lunch)} />
              <MealSlot label="Dinner" value={day.dinner} icon="🍲" onClick={() => handleMealClick(day.dinner)} />
            </div>
          </div>
        )) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-block p-8 bg-slate-50 rounded-full mb-6">
              <CalendarIcon size={64} className="text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-black text-2xl">Calendar is Empty</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mb-10 leading-relaxed">Let AI create a balanced plan using ONLY what's in your fridge right now.</p>
            <button 
              onClick={handleGeneratePlan}
              disabled={inventory.length === 0}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95"
            >
              Start Planning
            </button>
          </div>
        )}
      </div>

      {/* Recipe Steps Modal */}
      {(fetchingRecipe || selectedRecipe) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><ChefHat size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{fetchingRecipe ? 'Gemini is cooking...' : selectedRecipe?.title}</h3>
                  <p className="text-slate-400 text-sm">{fetchingRecipe ? 'Generating instructions based on your inventory.' : `Ready in ${selectedRecipe?.prepTime}`}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="p-3 bg-white border rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10">
              {fetchingRecipe ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <Loader2 className="animate-spin text-indigo-600" size={64} />
                  <p className="text-indigo-600 font-black animate-pulse text-lg">Thinking up the perfect steps...</p>
                </div>
              ) : selectedRecipe && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Ingredients</h4>
                    <ul className="space-y-3">
                      {selectedRecipe.ingredients.map((ing, i) => {
                        const inStock = checkInStock(ing.name);
                        return (
                          <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex gap-2">
                              {inStock ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={14} className="text-amber-400 mt-0.5" />}
                              <span className="text-sm font-bold text-slate-700 truncate">{ing.name}</span>
                            </div>
                            <span className="text-[10px] bg-white px-2 py-1 rounded-md font-black text-indigo-600 shadow-sm shrink-0">{ing.amount}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white space-y-3">
                      <p className="text-indigo-100 text-[10px] leading-relaxed">Cooking this will update your inventory automatically.</p>
                      <button 
                        onClick={() => { onCook(selectedRecipe); setSelectedRecipe(null); }}
                        className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-50 transition-all text-[10px] uppercase tracking-widest"
                      >
                        Finish Cooking
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Step-by-Step Instructions</h4>
                    <div className="space-y-6">
                      {selectedRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100">{i + 1}</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 bg-slate-50/50 flex justify-end">
              <button onClick={() => setSelectedRecipe(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95">Close Recipe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MealSlot = ({ label, value, icon, onClick }: { label: string, value: string, icon: string, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="p-8 space-y-4 hover:bg-indigo-50/50 transition-all cursor-pointer relative group/slot"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center shadow-sm">
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover/slot:text-indigo-400 transition-colors">{label}</span>
    </div>
    <p className="text-slate-800 font-bold leading-snug text-lg group-hover/slot:text-indigo-700 transition-colors">{value}</p>
    <div className="absolute top-8 right-8 opacity-0 group-hover/slot:opacity-100 transition-opacity bg-white p-1 rounded-md text-[10px] font-black text-indigo-500 uppercase border border-indigo-100 shadow-sm">
      View Recipe
    </div>
  </div>
);

export default MealPlanner;
