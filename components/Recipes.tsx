
import React, { useState } from 'react';
import { ChefHat, Search, Loader2, Clock, Users, ArrowRight, Plus, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { InventoryItem, FamilyProfile, Recipe } from '../types';
import { generateRecipes, getRecipeForMeal } from '../services/geminiService';

interface Props {
  inventory: InventoryItem[];
  profile: FamilyProfile;
  savedRecipes: Recipe[];
  onUpdateRecipes: (recipes: Recipe[]) => void;
  onCook: (recipe: Recipe) => void;
}

const Recipes: React.FC<Props> = ({ inventory, profile, savedRecipes, onUpdateRecipes, onCook }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const results = await generateRecipes(inventory, profile);
      onUpdateRecipes(results);
    } catch (err) {
      console.error("Recipe Generation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await getRecipeForMeal(searchQuery, inventory, profile);
      onUpdateRecipes([result, ...savedRecipes].slice(0, 9));
      setSearchQuery('');
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkInStock = (ingredientName: string) => {
    return inventory.some(item => 
      item.name.toLowerCase().includes(ingredientName.toLowerCase()) || 
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 justify-center md:justify-start">
              Chef AI <ChefHat className="text-indigo-600" />
            </h2>
            <p className="text-slate-500 font-medium text-sm">Personalized recipes for <b>{profile.size} people</b>.</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || inventory.length === 0}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 md:px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95 whitespace-nowrap"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ChefHat size={20} />}
            {loading ? 'Thinking...' : 'Generate Ideas'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search healthy pasta for dinner..."
            className="w-full pl-16 pr-32 py-4 md:py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-600 transition-all"
          >
            Ask AI
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {savedRecipes.map((recipe, idx) => (
          <div 
            key={recipe.id || idx}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
          >
            <div className="relative h-48 md:h-64 bg-slate-100">
              <img 
                src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&h=400&sig=${idx}`} 
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 md:top-6 left-4 md:left-6 flex gap-2">
                <span className="bg-white/95 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black text-slate-800 flex items-center gap-2 shadow-sm uppercase tracking-widest">
                  <Clock size={12} className="text-indigo-600" /> {recipe.prepTime}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">{recipe.title}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
                {recipe.matchingItems.slice(0, 2).map(item => (
                  <span key={item} className="text-[8px] md:text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 md:px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                    {item}
                  </span>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-slate-50 rounded-2xl text-slate-800 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">
                View Recipe <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && savedRecipes.length === 0 && (
        <div className="text-center py-20 md:py-32 bg-white rounded-[2rem] border border-dashed border-slate-200 p-8">
          <div className="inline-block p-8 md:p-10 bg-slate-50 rounded-full mb-6 md:mb-8 text-slate-200">
            <ChefHat size={60} />
          </div>
          <h3 className="text-slate-800 font-black text-2xl md:text-3xl">Hungry?</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mt-4 text-sm md:text-base">Search for a recipe or generate ideas based on your fridge stock!</p>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] md:rounded-[3rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <button 
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-50 bg-white/20 hover:bg-rose-500 p-2 md:p-3 rounded-2xl text-white backdrop-blur-md transition-all shadow-xl"
            >
              <Plus size={20} className="rotate-45" />
            </button>

            <div className="relative h-48 md:h-72 flex-shrink-0">
              <img 
                src={`https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=1200&h=400`} 
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/90 to-transparent">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">{selectedRecipe.title}</h2>
                <div className="flex gap-6">
                  <span className="flex items-center gap-2 text-white font-black text-xs"><Clock size={16} className="text-indigo-400" /> {selectedRecipe.prepTime}</span>
                  <span className="flex items-center gap-2 text-white font-black text-xs"><Users size={16} className="text-indigo-400" /> Serves {profile.size}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 overflow-y-auto no-scrollbar">
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h4 className="text-[9px] font-black uppercase text-indigo-600 tracking-widest mb-4">Ingredients</h4>
                  <ul className="space-y-3">
                    {selectedRecipe.ingredients.map((ing, i) => {
                      const inStock = checkInStock(ing.name);
                      return (
                        <li key={i} className="flex justify-between items-center pb-3 border-b border-slate-50">
                          <div className="flex gap-2">
                             {inStock ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={14} className="text-amber-400 mt-0.5" />}
                             <p className="font-bold text-slate-800 text-[11px] truncate">{ing.name}</p>
                          </div>
                          <span className="bg-slate-50 px-2 py-0.5 rounded text-[9px] font-black text-indigo-600 shrink-0 ml-2">{ing.amount}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="bg-indigo-600 rounded-2xl p-6 text-white space-y-3">
                   <p className="text-indigo-100 text-[10px] leading-relaxed">Prepare this dish and we'll automatically update your fridge stock.</p>
                   <button 
                    onClick={() => { onCook(selectedRecipe); setSelectedRecipe(null); }}
                    className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-50 transition-all text-[10px] uppercase tracking-widest"
                   >
                     Finish Cooking
                   </button>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-8">
                <h4 className="text-[9px] font-black uppercase text-indigo-600 tracking-widest mb-6">Instructions</h4>
                <div className="space-y-6 md:space-y-8">
                  {selectedRecipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-6 group">
                      <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-sm md:text-lg border border-slate-100 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed text-sm md:text-base">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
