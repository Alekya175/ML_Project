import {useEffect,useMemo,useState} from 'react';import {Search} from 'lucide-react';import {api} from '../services/api';import {inp,btn2} from '../components/ui';
import CourseActions from '../components/CourseActions';import {useLearning} from '../services/useLearning';
export default function Courses(){const L=useLearning(),[all,setAll]=useState([]),[score,setScore]=useState({}),[load,setLoad]=useState(true),[err,setErr]=useState(''),[q,setQ]=useState(''),[sort,setSort]=useState('match');
 const blank={category:'',difficulty:'',provider:'',domain:'',skill:'',minRating:'',maxWeeks:''},[fl,setFl]=useState(blank);
 useEffect(()=>{api('/courses').then(setAll).catch(e=>setErr(e.message)).finally(()=>setLoad(false));
  api('/recommendations').then(r=>setScore(Object.fromEntries(r.filter(x=>x.courseId).map(x=>[x.courseId._id,x.finalScore])))).catch(()=>{})},[]);
 const opts=k=>[...new Set(all.flatMap(c=>k==='skill'?c.skillsRequired:[c[k]]))].sort();
 const list=useMemo(()=>{const t=q.toLowerCase();return all.filter(c=>(!t||(c.name+' '+c.skillsRequired.join(' ')+' '+c.category).toLowerCase().includes(t))
  &&['category','difficulty','provider','domain'].every(k=>!fl[k]||c[k]===fl[k])&&(!fl.skill||c.skillsRequired.includes(fl.skill))&&(!fl.minRating||c.rating>=+fl.minRating)&&(!fl.maxWeeks||c.weeks<=+fl.maxWeeks))
  .sort((a,b)=>sort==='rating'?b.rating-a.rating:sort==='duration'?a.weeks-b.weeks:sort==='recent'?new Date(b.createdAt)-new Date(a.createdAt):(score[b._id]??-1)-(score[a._id]??-1)||b.rating-a.rating)},[all,q,fl,sort,score]);
 const sel=(k,label)=><select aria-label={label} className={inp} value={fl[k]} onChange={e=>setFl({...fl,[k]:e.target.value})}><option value="">{label}</option>{opts(k).map(o=><option key={o}>{o}</option>)}</select>;
 return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-3xl font-extrabold text-slate-900">Explore Courses</h1>
 <div className="relative mt-6"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><input className={inp+' pl-11'} placeholder="Search by course name or skill" value={q} onChange={e=>setQ(e.target.value)}/></div>
 <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{sel('category','Category')}{sel('difficulty','Difficulty')}{sel('provider','Provider')}{sel('domain','Domain')}{sel('skill','Skill')}
  <select aria-label="Duration" className={inp} value={fl.maxWeeks} onChange={e=>setFl({...fl,maxWeeks:e.target.value})}><option value="">Any duration</option><option value="4">Up to 4 weeks</option><option value="8">Up to 8 weeks</option><option value="12">Up to 12 weeks</option></select>
  <select aria-label="Rating" className={inp} value={fl.minRating} onChange={e=>setFl({...fl,minRating:e.target.value})}><option value="">Any rating</option><option value="4.5">4.5 and up</option><option value="4.7">4.7 and up</option></select>
  <select aria-label="Sort" className={inp} value={sort} onChange={e=>setSort(e.target.value)}><option value="match">Highest match</option><option value="rating">Highest rating</option><option value="duration">Shortest duration</option><option value="recent">Recently added</option></select></div>
 {err&&<p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
 {load?<p className="p-10 text-center text-slate-500">Loading courses…</p>:!list.length?<div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center"><p className="font-semibold">No courses match the selected filters.</p><button className={btn2+' mt-4'} onClick={()=>{setFl(blank);setQ('')}}>Clear filters</button></div>:
 <div className="mt-6 grid gap-6 md:grid-cols-2">{list.map(c=><article key={c._id} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
  <div className="flex items-start justify-between gap-3"><h2 className="font-bold text-slate-900">{c.name}</h2>{score[c._id]!=null&&<span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">{score[c._id]}% match</span>}</div>
  <p className="mt-1 text-sm text-slate-500">{c.provider} · {c.difficulty} · {c.duration} · {c.rating} ★</p><p className="mt-2 text-sm text-slate-600"><b>{c.category}</b> · {c.skillsRequired.join(', ')}</p>
  <CourseActions c={c} L={L}/></article>)}</div>}</main>}
