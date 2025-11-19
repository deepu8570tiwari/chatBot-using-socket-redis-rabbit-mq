"use client";
import React, { useEffect, useState } from 'react'
import { chatService, useAppData, User } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/Loading';
import ChatSideBar from '../components/ChatSideBar';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import { create } from 'domain';
import ChatHeader from '../components/ChatHeader';
import { Menu } from 'lucide-react';
import ChatMessages from '../components/ChatMessages';
import MessageInput from '../components/MessageInput';

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicid:string;
  };
  messageType:"text"|"image";
  seen:boolean;
  seenAt?:string;
  createdAt:string;
}
const ChatApp = () => {
  const {loading, isAuth,logoutUser, chats, user:loggedInUser,users,fetchChats,setChats}=useAppData();
  const [selectedUser,setSelectedUser]=useState<string | null>(null);
  const [message,setMessage]=useState("");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [messages,setMessages]=useState<Message[]| null>(null);
  const [user,setUsers]=useState<User |null>(null);
  const [showAllUsers, setShowAllUsers]=useState(false);
  const [isTyping, setIsTyping]=useState(false);
  const [typingTimeOut, setTypingTimeOut]=useState<NodeJS.Timeout|null>(null);
  const router=useRouter();
  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login");
    }
  },[isAuth, router, loading]);

  const handleLogout=()=>logoutUser();
  async function fetchChat(){
    try {
      const token =Cookies.get("token");
      const {data}= await axios.get(`${chatService}/api/v1/chat/message/${selectedUser}`,{
        headers:{
          Authorization:`Bearer ${token}`,
        }
      })
      setMessages(data.messages);
      setUsers(data.otherUser.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("failed to load error");
    }
  }
  async function createChat(u:User){
    try {
      const token =Cookies.get("token");
      const {data}= await axios.post(`${chatService}/api/v1/chat/create-chat`,{
        otherUserId:u._id
      },{
        headers:{
          Authorization:`Bearer ${token}`,
        }
      })
      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      toast.error("failed to start chat");
    }
  }
  useEffect(()=>{
    if(selectedUser){
      fetchChat();
    }
  },[selectedUser])
  if(loading) return <Loading/>;
  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSideBar 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen} 
      showAllUsers={showAllUsers}
      setShowAllUsers={setShowAllUsers} 
      users={users} 
      loggedInUser={loggedInUser} 
      chats={chats} 
      selectedUser={selectedUser}
      setSelectdUser={setSelectedUser} 
      handleLogout={handleLogout}
      createChat={createChat}/>
     {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5  border-white/10">
          {/* CHAT HEADER */}
          <ChatHeader 
            user={user}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
          />
          <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser}/>
          <MessageInput/>
      </div>
    </div>
  )
}

export default ChatApp
