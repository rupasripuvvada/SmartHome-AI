
import React, { useState } from 'react';
import { FamilyProfile, DietPreference } from '../types';
import { 
  User, 
  Users, 
  ShieldAlert, 
  Heart, 
  CheckCircle2, 
  Mail, 
  Plus, 
  Send,
  Inbox,
  Settings,
  Shield,
  Clock,
  X
} from 'lucide-react';

interface Props {
  profile: FamilyProfile;
  onUpdate: (profile: FamilyProfile) => void;
  user: { name: string; email: string } | null;
  emailLogs?: {id: string, subject: string, body: string, date: string, status: string}[];
  onTestEmail?: () => void;
}

const Profile: React.FC<Props> = ({ profile, onUpdate, user, emailLogs = [], onTestEmail }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'inbox' | 'security'>('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FamilyProfile>(profile);
  const [newAllergy, setNewAllergy] = useState('');
  const [selectedMail, setSelectedMail] = useState<typeof emailLogs[0] | null>(null);

  const handleSave = () => {
    onUpdate(formData);
    setEditing(false);
  };

  const addAllergy = () => {
    if (newAllergy && !formData.allergies.includes(newAllergy)) {
      setFormData({ ...formData, allergies: [...formData.allergies, newAllergy] });
      setNewAllergy('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 md:w-2 bg-indigo-600 h-full"></div>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
          <User size={40} />
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate">{user?.name}</h2>
          <p className="text-slate-400 font-bold text-xs truncate">{user?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Verified</span>
            <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Pro Hub</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <TabBtn active={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} icon={<Settings size={18} />} />
           <TabBtn active={activeSubTab === 'inbox'} onClick={() => setActiveSubTab('inbox')} icon={<Inbox size={18} />} />
           <TabBtn active={activeSubTab === 'security'} onClick={() => setActiveSubTab('security')} icon={<Shield size={18} />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeSubTab === 'profile' && (
            <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Kitchen Config</h3>
                <button onClick={() => editing ? handleSave() : setEditing(true)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                  {editing ? 'Confirm' : 'Update'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Household Size</label>
                  {editing ? (
                    <input type="number" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-sm" value={formData.size} onChange={e => setFormData({...formData, size: Number(e.target.value)})} />
                  ) : (
                    <p className="text-xl font-black text-slate-800">{profile.size} Members</p>
                  )}
                </div>
                <div className="space-y-2">
                   <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Dietary Preference</label>
                   {editing ? (
                     <select className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs" value={formData.preference} onChange={e => setFormData({...formData, preference: e.target.value as DietPreference})}>
                        {Object.values(DietPreference).map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                   ) : (
                     <p className="text-xl font-black text-slate-800 flex items-center gap-2"><Heart size={20} className="text-rose-500" fill="currentColor" /> {profile.preference}</p>
                   )}
                </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Safety & Allergies</label>
                 <div className="flex flex-wrap gap-2">
                    {profile.allergies.map(a => (
                      <span key={a} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-rose-100 flex items-center gap-2">
                        <ShieldAlert size={12} /> {a}
                        {editing && <button onClick={() => setFormData({...formData, allergies: formData.allergies.filter(x => x !== a)})}><Plus size={12} className="rotate-45" /></button>}
                      </span>
                    ))}
                    {editing && (
                      <div className="flex gap-2">
                        <input type="text" className="bg-slate-50 px-3 rounded-lg text-[10px] font-bold outline-none border border-slate-100" placeholder="Add..." value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAllergy()} />
                        <button onClick={addAllergy} className="bg-indigo-600 text-white p-1.5 rounded-lg"><Plus size={14} /></button>
                      </div>
                    )}
                    {!editing && profile.allergies.length === 0 && <p className="text-slate-400 italic text-[11px]">No restrictions logged.</p>}
                 </div>
              </div>
            </div>
          )}

          {activeSubTab === 'inbox' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2"><Mail size={18} className="text-indigo-600" /> Alerts Inbox</h3>
                <button onClick={onTestEmail} className="bg-white border border-slate-200 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50"><Send size={12} /> Test Alert</button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar max-h-[500px]">
                {emailLogs.length > 0 ? emailLogs.map(mail => (
                  <div key={mail.id} onClick={() => setSelectedMail(mail)} className="p-5 hover:bg-indigo-50/30 cursor-pointer transition-all flex justify-between items-start">
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></div>
                         <h4 className="font-bold text-slate-800 text-xs truncate">{mail.subject}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate italic">{mail.body}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                       <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">{mail.date.split(',')[0]}</span>
                       <span className="text-[7px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{mail.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <Mail size={32} className="text-slate-100" />
                    <p className="text-slate-400 font-bold text-xs">Inbox is empty.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Security Hub</h3>
               <div className="space-y-4">
                  <SecurityToggle label="AI Image Processing" active={true} />
                  <SecurityToggle label="Cloud Sync" active={true} />
                  <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 mt-6">
                    <p className="text-rose-600 font-black text-[9px] uppercase tracking-widest mb-1">Privacy</p>
                    <button className="text-rose-600 text-xs font-bold underline">Wipe all stored data</button>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">System Pulse</h4>
             <div className="space-y-4">
                <StatusRow label="Sync Status" status="Healthy" />
                <StatusRow label="AI Engine" status="v3.1-Flash" />
                <StatusRow label="Encryption" status="AES-256" />
             </div>
           </div>

           <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <Shield size={32} className="text-indigo-200 mb-4" />
              <h4 className="text-base font-black mb-1">Pro Protection</h4>
              <p className="text-indigo-100 text-[10px] font-medium leading-relaxed">Your data is secured with enterprise-grade encryption.</p>
           </div>
        </div>
      </div>

      {/* Simplified Modal for Mail */}
      {selectedMail && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50">
               <h3 className="text-base font-black text-slate-900 truncate pr-4">{selectedMail.subject}</h3>
               {/* Fix: Added missing X icon for closing modal */}
               <button onClick={() => setSelectedMail(null)} className="p-2 text-slate-400 hover:text-indigo-600"><X size={20} /></button>
            </div>
            <div className="p-6 md:p-8 space-y-6">
               <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base max-h-[60vh] overflow-y-auto no-scrollbar">
                 {selectedMail.body}
               </div>
            </div>
            <div className="p-5 bg-slate-50 flex justify-end">
               <button onClick={() => setSelectedMail(null)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`flex-1 sm:flex-none p-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
    {icon}
  </button>
);

const StatusRow = ({ label, status }: any) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">{status}</span>
  </div>
);

const SecurityToggle = ({ label, active }: any) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-xs font-bold text-slate-700">{label}</span>
    <div className={`w-10 h-5 rounded-full p-0.5 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

export default Profile;
