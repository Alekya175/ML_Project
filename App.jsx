import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider,useAuth} from './context/AuthContext';import Nav from './components/Nav';
import Landing from './pages/Landing';import Auth from './pages/Auth';import ProfileSetup from './pages/ProfileSetup';import Recommendations from './pages/Recommendations';import Courses from './pages/Courses';import CourseDetail from './pages/CourseDetail';import MyLearning from './pages/MyLearning';
const Guard=({children})=>{const{user,loading}=useAuth();if(loading)return <p className="p-16 text-center text-slate-500">Loading…</p>;return user?children:<Navigate to="/login" replace/>};
const Soon=({t})=><div className="mx-auto max-w-xl p-16 text-center"><h1 className="text-2xl font-bold">{t}</h1><p className="mt-2 text-slate-500">This page arrives in the next build stage.</p></div>;
export default function App(){return <AuthProvider><BrowserRouter><Nav/><Routes>
 <Route path="/" element={<Landing/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/>
 <Route path="/profile-setup" element={<Guard><ProfileSetup/></Guard>}/><Route path="/recommendations" element={<Guard><Recommendations/></Guard>}/>
 <Route path="/courses" element={<Guard><Courses/></Guard>}/><Route path="/courses/:id" element={<Guard><CourseDetail/></Guard>}/><Route path="/my-learning" element={<Guard><MyLearning/></Guard>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter></AuthProvider>}
