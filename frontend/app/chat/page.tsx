"use client";
import React, { useEffect } from 'react'
import { useAppData } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/Loading';

const ChatApp = () => {
  const {loading, isAuth}=useAppData();
  const router=useRouter();
  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login");
    }
  },[isAuth, router, loading]);
  if(loading) return <Loading/>;
  return (
    <div>
      ChatApp
    </div>
  )
}

export default ChatApp
