"use client"
import axios, { Axios } from 'axios'
import { ArrowRight, ChevronDown, ChevronLeft, Loader2, Lock } from 'lucide-react'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Cookies from "js-cookie";
import { useAppData, userService } from '../context/AppContext'
import Loading from './Loading'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
  const {isAuth,setIsAuth,setUser,loading:userLoading,fetchChats, fetchUsers}=useAppData()
  const [loading,setLoading]=useState(false);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [error, setError]=useState("");
  const [resendLoading, setresendLoading] = useState(false);
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router=useRouter();
  const searchParams=useSearchParams();
  const email=searchParams.get("email")|| "";
  useEffect(() => {
  if (timer <= 0) return; // stop when timer reaches 0
  const interval = setInterval(() => {
    setTimer(prev => prev - 1);
  }, 1000);
  return () => clearInterval(interval);
}, []); // empty dependency array, run once

  console.log(timer);
const handleInputChange = (index: number, value: string) => {
  if (!/^\d?$/.test(value)) return; // numeric only

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);
  setError("");

  if (value && index < otp.length - 1) {
    inputRefs.current[index + 1]?.focus();
  }
};

const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};
const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pasteData = e.clipboardData.getData("Text").trim();
  if (!/^\d+$/.test(pasteData)) return; // only digits
  const newOtp = [...otp];
  // Fill OTP inputs with the pasted data (up to otp length)
  for (let i = 0; i < otp.length; i++) {
    newOtp[i] = pasteData[i] || "";
  }
  setOtp(newOtp);
  // Focus last filled input or last input
  const lastFilledIndex = Math.min(pasteData.length, otp.length) - 1;
  inputRefs.current[lastFilledIndex]?.focus();
};

  const handleSubmit=async(e: { preventDefault: () => void; })=>{
    e.preventDefault();
    const optString=otp.join("");
    if(optString.length!=6){
      setError("Please Enter all 6 Digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${userService}/api/v1/verify`, {
        email,
        otp:optString,
      });
      toast.success(data.message);
      Cookies.set("token",data.token,{expires:15,secure:false,path:"/" });
      setOtp(["","","","","",""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error:any) {
      setError(error.response.data.message);
    } finally{
      setLoading(false);
    }
  }
  const handleResendOtp=async()=>{
    setresendLoading(true);
    setError("");
    try {
       const { data } = await axios.post(`${userService}/api/v1/login`, {
        email,
      });
      toast.success(data.message);
      setTimer(60);
    } catch (error:any) {
      setError(error.response.data.message);
    }finally{
      setresendLoading(false);
    }
  }
  if(userLoading) return <Loading/>;
  if(isAuth) redirect("/chat");
  return (
    <div className="min-h-screen  bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
                <div className='text-center mb-8 relative'>
                  <button className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white cursor-pointer" onClick={()=>router.push("/login")}><ChevronLeft className='w-6 h-6'/></button>
                    <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
                        <Lock size={40} className="text-white"/>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Verify your account
                    </h1>
                    <p className='text-gray-300 text-lg'>We have sent 6 digits code to your Email Account</p>
                    <p className="text-blue-400 font-medium">{email}</p>
                </div>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-grey-300 mb-4 text-center text-white'>
                            Enter your 6 digits OTP Here </label>
                       <div className='flex justify-center in-checked: space-x-3'>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el: HTMLInputElement | null) => {
                              inputRefs.current[index] = el; // assign ref
                            }}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            style={{ width: "40px", textAlign: "center", fontSize: "18px" }}
                            className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg text-white'
                          />
                        ))}


                       </div>
                    </div>
                    {
                      error && <div className='bg-red-900 border border-red-700 rounded-lg p-3'>
                        <p className="text-red-300 text-sm text-center">{error}</p>
                        </div>
                    }
                    <button type="submit" className='cursor-pointer w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold
                    hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' disabled={loading}
                    >
                      {
                        loading? (<div className="flex items-center justify-center gap-2">
                          <Loader2 className='w-5 h-5'/> verifying your account ....
                        </div>): (<div className="flex items-center justify-center gap-2">
                            <span>Verify Email</span> 
                            <ArrowRight className="w-5 h-5"/>   
                        </div>)
                      }
                        
                    </button>
                </form>
                <div className='mt-6 text-center'>
                  <p className='text-gray-400 text-sm mb-4'>Didn't recieve the code</p>
                  {
                    timer>0 ? <p className='text-gray-400 text-sm'>Resend Code In {timer} second</p>: <button onClick={handleResendOtp} className='text-blue-600 hover:text-blue-200 font-medium
                    text-sm disabled:opacity-50 cursor-pointer' disabled={resendLoading}>{resendLoading ? 'Sending...':"Resend OTP"}</button>
                  }
                </div>
            </div>
        </div>
    </div>
  )
}

export default VerifyOtp
