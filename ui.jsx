export const Chips=({options,value,onChange})=><div className="flex flex-wrap gap-2">{options.map(o=>{const on=value.includes(o);
 return <button type="button" key={o} aria-pressed={on} onClick={()=>onChange(on?value.filter(x=>x!==o):[...value,o])}
 className={`rounded-full border px-4 py-2 text-sm font-medium transition ${on?'border-indigo-600 bg-indigo-600 text-white':'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>{o}</button>})}</div>;
export const Ring=({v,size=64})=>{const r=26,c=2*Math.PI*r;return <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${v}% match`}>
 <circle cx="32" cy="32" r={r} fill="none" stroke="#e0e7ff" strokeWidth="6"/>
 <circle cx="32" cy="32" r={r} fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-v/100)} transform="rotate(-90 32 32)"/>
 <text x="32" y="37" textAnchor="middle" className="fill-slate-900 text-[15px] font-bold">{v}%</text></svg>};
export const Field=({label,children})=><label className="block text-sm font-semibold text-slate-700">{label}<div className="mt-1.5 font-normal">{children}</div></label>;
export const inp="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
export const btn="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60";
export const btn2="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-800 transition hover:border-indigo-300";
export const DEPTS=['Artificial Intelligence & Machine Learning','Computer Science','Information Technology','Electronics & Communication','Electrical Engineering','Mechanical Engineering','Civil Engineering','Other'];
