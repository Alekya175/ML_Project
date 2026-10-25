import {createContext,useContext,useEffect,useState} from 'react';import {api} from '../services/api';
const Ctx=createContext();export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
 const[user,setUser]=useState(null),[loading,setLoading]=useState(!!localStorage.getItem('token'));
 const refresh=async()=>{const u=await api('/profile');setUser(u);return u};
 useEffect(()=>{if(localStorage.getItem('token'))refresh().catch(()=>{}).finally(()=>setLoading(false))},[]);
 const done=({token,user})=>{localStorage.setItem('token',token);setUser(user);return user};
 const login=async(email,password)=>done(await api('/auth/login',{method:'POST',body:{email,password}}));
 const register=async b=>done(await api('/auth/register',{method:'POST',body:b}));
 const logout=()=>{localStorage.removeItem('token');setUser(null)};
 return <Ctx.Provider value={{user,loading,login,register,logout,refresh}}>{children}</Ctx.Provider>}
