"use client";
import React, { useEffect, useState } from 'react'
import { chatService, useAppData, User } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/Loading';
import ChatSideBar from '../components/ChatSideBar';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import MessageInput from '../components/MessageInput';
import { SocketData } from '../context/SocketContext';

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  fileUrl:string;
  filePublicId:string;
  messageType:"text"|"image";
  seen:boolean;
  seenAt?:string;
  createdAt:string;
}
const ChatApp = () => {
  const {loading, isAuth,logoutUser, chats, user:loggedInUser,users,fetchChats,setChats}=useAppData();
  const {onlineUsers, socket}=SocketData();
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
      setUsers(data.user.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("failed to load error");
    }
  }
  const moveChatToTop=(chatId:string, newMessage:any, updatedUnseenCount=true)=>{
    setChats((prev)=>{
      if(!prev) return null;
      const updatedChats=[...prev];
      const chatIndex=updatedChats.findIndex(
        (chat)=>chat.chat._id===chatId
      );
      if(chatIndex!==-1){
        const [movedChat]=updatedChats.splice(chatIndex,1);
        const updatedChat={
          ...movedChat,
          chat:{
            ...movedChat.chat,
            latestMessage:{
              text:newMessage.text,
              sender:newMessage.sender,
            },
            updatedAt:new Date().toString(),
            unseenCount:updatedUnseenCount && newMessage.sender!==loggedInUser?._id 
              ?(movedChat.chat.unseenCount || 0)+1
              : movedChat.chat.unseenCount || 0,
          }
        };
        updatedChats.unshift(updatedChat)
      }
      return updatedChats
    })
  }
  const resetUnseenCount=(chatId:string)=>{
    setChats((prev)=>{
      if(!prev) return null;
      return prev.map((chat)=>{
        if(chat.chat._id===chatId){
          return {
            ...chat,
            chat:{
              ...chat.chat,
              unseenCount:0
            }
          }
        }
        return chat;
      })
    })
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
  const handleMessageSend=async(e:any, imageFile?:File | null)=>{
    e.preventDefault();
    if(!message.trim() && !imageFile) return
    
    if(!selectedUser) return;
    //socket work
    if(typingTimeOut){
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }
    socket?.emit("stopTyping",{
      chatId:selectedUser,
      userId:loggedInUser?._id
    })
    const token=Cookies.get("token");
    try {
      const formData=new FormData();
      formData.append("chatId",selectedUser);
      if(message.trim()){
        formData.append("text",message);
      }
      if(imageFile){
        formData.append("imageFile",imageFile);
      }
      const {data}=await axios.post(`${chatService}/api/v1/chat/message`,formData,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"multipart/form-data"
        },
      })
      setMessages((prev)=>{
        const currentMessages=prev|| [];
        const messageExists=currentMessages.some(
          (msg)=>msg._id===data.message._id);
          if(!messageExists){
            return [...currentMessages, data.message]
          }
          return currentMessages;
      })
      setMessage("");
      const displayText=imageFile?"📷 image":message;
    } catch (error:any) {
      toast.error(error.response.data.message);
    }
  }
  const handleTyping=(value:string)=>{
    setMessage(value);
    if(!selectedUser || !socket) return;
    //socket setup
    if(value.trim()){
      socket.emit("typing",{
        chatId:selectedUser,
        userId:loggedInUser?._id,
      })
    }
    if(typingTimeOut){
      clearTimeout(typingTimeOut);
    }
    const timeout=setTimeout(()=>{
      socket.emit("stopTyping",{
        chatId:selectedUser,
        userId:loggedInUser?._id,
      })
    },2000);
    setTypingTimeOut(timeout);
  }

  useEffect(()=>{
    socket?.on("newMessage",(message)=>{
      console.log("Received new message:",message);
      if(selectedUser===message.chatId){
        setMessages((prev)=>{
          const currentMessages=prev || [];
          const messageExists=currentMessages.some(
            (msg)=>msg._id===message._id
          )
          if(!messageExists){
            return [...currentMessages,message]
          }
          return currentMessages;
        })
        moveChatToTop(message.chatId, message, false)
      }
    })
    socket?.on("userTyping",(data)=>{
      console.log("received user typing", data);
      if(data.chatId==selectedUser && data.userId!==loggedInUser?._id){
        setIsTyping(true);
      }
    })
    socket?.on("userStoppedTyping",(data)=>{
      console.log("received user Stopped typing", data);
      if(data.chatId==selectedUser && data.userId!==loggedInUser?._id){
        setIsTyping(false);
      }
    })
    return ()=>{
      socket?.off("newMessage");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");

    }
  },[socket, selectedUser,setChats, loggedInUser?._id]);
  useEffect(()=>{
    if(selectedUser){
      fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser);
      socket?.emit("joinChat",selectedUser);
      return ()=>{
        socket?.emit("leaveChat",selectedUser);
        setMessages(null);
      }
    }
  },[selectedUser, socket,]);
  useEffect(()=>{
    return ()=>{
      if(typingTimeOut){
        clearTimeout(typingTimeOut)
      }
    }
  }, [typingTimeOut])
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
      createChat={createChat}
      onlineUsers={onlineUsers}/>
     {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5  border-white/10">
          {/* CHAT HEADER */}
          <ChatHeader 
            user={user}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
            onlineUsers={onlineUsers}
          />
          <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser}/>
          <MessageInput 
          selectedUser={selectedUser} 
          message={message} 
          setMessage={handleTyping} 
          handleMessageSend={handleMessageSend}/>
      </div>
    </div>
  )
}

export default ChatApp
