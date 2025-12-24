
import React from 'react';
import { WarrantyAsset } from '../types';
import { Trash2, ShieldCheck, Calendar, Cpu, ArrowRight } from 'lucide-react';

interface Props {
  assets: WarrantyAsset[];
  onRemove: (id: string) => void;
}

const AssetVault: React.FC<Props> = ({ assets, onRemove }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => {
          const expiryDate = new Date(asset.expiryDate);
          const isExpired = expiryDate < new Date();
          const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));

          return (
            <div key={asset.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                  <ShieldCheck size={20} />
                </div>
                <button onClick={() => onRemove(asset.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2">{asset.productName}</h3>
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{asset.brand}</p>
              </div>

              <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Expires</span>
                  </div>
                  <span className={`text-sm font-black ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                    {asset.expiryDate}
                  </span>
                </div>
                
                {asset.modelNumber && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Cpu size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Model</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{asset.modelNumber}</span>
                  </div>
                )}

                <div className={`mt-2 p-3 rounded-xl flex items-center justify-between transition-all ${isExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest">
                     {isExpired ? 'Coverage Ended' : `${daysLeft} Days Coverage`}
                   </span>
                   <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}

        {assets.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <ShieldCheck size={48} className="text-slate-100 mb-4" />
            <h3 className="text-slate-800 font-black text-lg">Digital Vault is empty</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">Upload warranty cards or asset photos to track digital coverage automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetVault;
