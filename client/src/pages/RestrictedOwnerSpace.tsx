import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, LockKeyhole, ShieldCheck, UsersRound, Film, Save, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Owner, ServiceProject } from '../types';

const PERMISSIONS = [
  ['manage_bookings', 'Bookings'], ['manage_lifecycle', 'Lifecycle'], ['manage_deliveries', 'Deliveries'],
  ['manage_works', 'Showcase'], ['manage_pricing', 'Pricing'], ['manage_cms', 'Studio profile']
] as const;

const emptyInvite = { name: '', phone: '', email: '', permissions: ['manage_lifecycle', 'manage_deliveries'], projectAccess: [] as string[] };

export function RestrictedOwnerSpace() {
  const { isOwnerAuthenticated, ownerData, ownerLogout, loginWithMasterPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [projects, setProjects] = useState<ServiceProject[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [draft, setDraft] = useState(emptyInvite);
  const [notice, setNotice] = useState('');

  const selectedOwner = useMemo(() => owners.find(owner => owner.id === selectedOwnerId), [owners, selectedOwnerId]);
  const primary = ownerData?.role === 'primary_owner' || ownerData?.permissions?.includes('manage_owners') || ownerData?.permissions?.includes('all');

  const load = async () => {
    setLoading(true);
    try {
      const [ownerRows, projectRows] = await Promise.all([api.getRestrictedOwners(), api.getRestrictedProjects()]);
      setOwners(ownerRows); setProjects(projectRows);
      if (!selectedOwnerId && ownerRows.find(o => o.role !== 'primary_owner')) setSelectedOwnerId(ownerRows.find(o => o.role !== 'primary_owner')!.id);
    } catch (e: any) { setError(e.message || 'Could not load restricted-access records.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOwnerAuthenticated && primary) void load(); }, [isOwnerAuthenticated, primary]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await loginWithMasterPassword(identifier, password); setPassword(''); }
    catch (e: any) { setError(e.message || 'Access was denied.'); }
    finally { setLoading(false); }
  };

  const toggle = (value: string, field: 'permissions' | 'projectAccess') => setDraft(current => ({
    ...current, [field]: current[field].includes(value) ? current[field].filter(item => item !== value) : [...current[field], value]
  }));

  const invite = async (event: FormEvent) => {
    event.preventDefault(); setNotice(''); setError(''); setLoading(true);
    try { await api.saveRestrictedOwner(draft); setDraft(emptyInvite); setNotice('Team member created with the selected project boundaries.'); await load(); }
    catch (e: any) { setError(e.message || 'Could not create the account.'); }
    finally { setLoading(false); }
  };

  const saveGrant = async () => {
    if (!selectedOwner) return; setLoading(true); setNotice(''); setError('');
    try { await api.saveRestrictedOwnerAccess(selectedOwner.id, { permissions: selectedOwner.permissions || [], projectAccess: selectedOwner.projectAccess || [], isActive: selectedOwner.isActive }); setNotice(`Access saved for ${selectedOwner.name}.`); await load(); }
    catch (e: any) { setError(e.message || 'Could not save this access rule.'); }
    finally { setLoading(false); }
  };

  const updateSelected = (field: 'permissions' | 'projectAccess', value: string) => setOwners(current => current.map(owner => owner.id !== selectedOwnerId ? owner : ({ ...owner, [field]: (owner[field] || []).includes(value) ? (owner[field] || []).filter(item => item !== value) : [...(owner[field] || []), value] })));

  if (!isOwnerAuthenticated) return <main className="max-w-md mx-auto py-20 px-5"><form onSubmit={signIn} className="glass-panel rounded-3xl border border-gold/30 p-7 space-y-5"><div className="text-center"><LockKeyhole className="mx-auto text-gold mb-3" /><h1 className="font-serif text-2xl font-bold">Restricted Owner Space</h1><p className="mt-2 text-sm text-ivory-400">Primary owner sign-in only. This console controls who can access each client project.</p></div>{error && <p className="text-sm text-red-300 bg-red-950/40 rounded-lg p-3">{error}</p>}<input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Primary owner email or phone" className="w-full rounded-xl bg-black/30 border border-ivory-600/30 p-3" /><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Master password" className="w-full rounded-xl bg-black/30 border border-ivory-600/30 p-3" /><button disabled={loading} className="w-full bg-gold text-black font-bold rounded-xl p-3">{loading ? 'Verifying…' : 'Unlock access console'}</button></form></main>;
  if (!primary) return <main className="max-w-xl mx-auto py-20 px-5 text-center"><ShieldCheck className="mx-auto text-gold mb-4" /><h1 className="font-serif text-3xl">Restricted</h1><p className="text-ivory-400 mt-3">Only the primary owner may change team or client-project permissions.</p><button onClick={ownerLogout} className="mt-6 px-4 py-2 border border-gold/40 rounded-lg">Sign out</button></main>;

  return <main className="max-w-7xl mx-auto px-5 py-10 space-y-8"><header className="flex flex-wrap gap-4 items-center justify-between border-b border-gold/20 pb-6"><div><span className="text-xs uppercase tracking-widest text-gold">Primary owner control</span><h1 className="font-serif text-3xl md:text-4xl font-bold">Client Project Restrictions</h1><p className="text-ivory-400 mt-2">Give each studio account exactly the project and capability access it needs.</p></div><button onClick={ownerLogout} className="border border-gold/40 rounded-lg px-4 py-2">Sign out</button></header>{(error || notice) && <p className={`rounded-xl p-3 text-sm ${error ? 'bg-red-950/40 text-red-200' : 'bg-emerald-950/40 text-emerald-200'}`}>{error || notice}</p>}<section className="grid lg:grid-cols-2 gap-6"><form onSubmit={invite} className="glass-panel rounded-3xl border border-gold/20 p-6 space-y-4"><h2 className="font-serif text-xl flex items-center gap-2"><UserPlus className="text-gold" /> Add restricted owner</h2><div className="grid sm:grid-cols-2 gap-3"><input required placeholder="Full name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="input" /><input required placeholder="Phone" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className="input" /></div><input required type="email" placeholder="Email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="input w-full" /><GrantEditor projects={projects} permissions={draft.permissions} projectAccess={draft.projectAccess} toggle={toggle} /><button disabled={loading} className="bg-gold text-black font-bold rounded-xl px-5 py-3">Create restricted owner</button></form><section className="glass-panel rounded-3xl border border-gold/20 p-6"><h2 className="font-serif text-xl flex items-center gap-2"><UsersRound className="text-gold" /> Studio access registry</h2><div className="mt-4 space-y-2">{owners.map(owner => <button key={owner.id} onClick={() => setSelectedOwnerId(owner.id)} className={`w-full text-left p-3 rounded-xl border ${owner.id === selectedOwnerId ? 'border-gold bg-gold/10' : 'border-ivory-600/20'}`}><b>{owner.name}</b><span className="block text-xs text-ivory-400">{owner.role.replace('_', ' ')} · {(owner.projectAccess || []).length ? `${owner.projectAccess!.length} project grants` : 'no project grants'}</span></button>)}</div></section></section>{selectedOwner && selectedOwner.role !== 'primary_owner' && <section className="glass-panel rounded-3xl border border-gold/30 p-6"><div className="flex justify-between gap-4 flex-wrap"><div><h2 className="font-serif text-2xl">{selectedOwner.name}</h2><p className="text-sm text-ivory-400">Edit their exact scope; changes take effect for new sessions.</p></div><button disabled={loading} onClick={saveGrant} className="bg-gold text-black rounded-xl font-bold px-5 py-3 flex items-center gap-2"><Save size={17} /> Save access</button></div><div className="mt-6"><GrantEditor projects={projects} permissions={selectedOwner.permissions || []} projectAccess={selectedOwner.projectAccess || []} toggle={(value, field) => updateSelected(field, value)} /></div></section>}</main>;
}

function GrantEditor({ projects, permissions, projectAccess, toggle }: { projects: ServiceProject[]; permissions: string[]; projectAccess: string[]; toggle: (value: string, field: 'permissions' | 'projectAccess') => void }) { return <div className="grid md:grid-cols-2 gap-6"><fieldset><legend className="text-sm font-bold mb-2">Capabilities</legend><div className="space-y-2">{PERMISSIONS.map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={permissions.includes(value)} onChange={() => toggle(value, 'permissions')} /> {label}</label>)}</div></fieldset><fieldset><legend className="text-sm font-bold mb-2 flex items-center gap-2"><Film size={15} /> Allowed client projects</legend><p className="text-xs text-ivory-400 mb-2">Leave all unchecked to deny all projects.</p><div className="max-h-40 overflow-auto space-y-2 pr-2">{projects.map(project => <label key={project.id} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={projectAccess.includes(project.id) || projectAccess.includes(project.bookingRef)} onChange={() => toggle(project.id, 'projectAccess')} /> {project.clientName} <span className="text-ivory-500">· {project.bookingRef}</span></label>)}</div></fieldset></div>; }
