import {Link} from 'react-router-dom';import {Bookmark,Play,Plus} from 'lucide-react';import {btn,btn2} from './ui';
export default function CourseActions({c,L,detail}){const id=c._id,e=L.path[id];
 return <div className="mt-4 flex flex-wrap gap-2">
 {!e||e.status==='recommended'?<button onClick={()=>L.enroll(id)} className={btn}><Play size={16}/>Enroll</button>:<Link to="/my-learning" className={btn}>{e.status==='completed'?'Completed':`Enrolled · ${e.progress}% done`}</Link>}
 <button onClick={()=>L.toggleSave(id)} className={btn2}><Bookmark size={16} fill={L.saved[id]?'currentColor':'none'}/>{L.saved[id]?'Saved':'Save Course'}</button>
 {!e&&<button onClick={()=>L.plan(id)} className={btn2}><Plus size={16}/>Add to Learning Path</button>}
 {e&&e.status==='recommended'&&<span className="self-center text-sm font-medium text-emerald-600">In your learning path</span>}
 {!detail&&<Link to={`/courses/${id}`} className={btn2}>View Course</Link>}
 {L.err&&<p role="alert" className="w-full text-sm text-red-600">{L.err}</p>}</div>}
