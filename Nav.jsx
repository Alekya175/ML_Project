import {Link,useNavigate} from 'react-router-dom';import {GraduationCap} from 'lucide-react';import {useAuth} from '../context/AuthContext';
export default function Nav(){const{user,logout}=useAuth(),nav=useNavigate(),l="text-sm font-medium text-slate-600 hover:text-indigo-600";
 return <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
 <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white"><GraduationCap size={20}/></span>CourseMate AI</Link>
 <nav className="hidden items-center gap-6 md:flex"><Link className={l} to="/">Home</Link><a className={l} href="/#how">How It Works</a><Link className={l} to="/courses">Courses</Link><a className={l} href="/#about">About</a></nav>
 <div className="flex items-center gap-2">{user?<><Link to="/recommendations" className="hidden text-sm font-semibold text-indigo-600 sm:block">Recommendations</Link><Link to="/my-learning" className="text-sm font-semibold text-indigo-600">My Learning</Link>
 <button onClick={()=>{logout();nav('/')}} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium">Logout</button></>:
 <><Link to="/login" className={l}>Login</Link><Link to="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Get Started</Link></>}</div></div></header>}
