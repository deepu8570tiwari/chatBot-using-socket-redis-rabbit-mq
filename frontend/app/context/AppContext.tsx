"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const userService = "http://localhost:8090";
export const chatService = "http://localhost:8091";

export interface User {
  username: any;
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount?: number;
}

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  logoutUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;

  chats: Chats[] | null;
  users: User[] | null;

  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}



const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${userService}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data.user);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      setLoading(false);
    }
  };

  async function logoutUser(){
    Cookies.remove("token");
    setIsAuth(false);
    setUser(null);
    toast.success("User logout Successfully");
  }
  const [chats,setChats]=useState<Chats[] | null>(null);
  async function fetchChats(){
    const token=Cookies.get("token");
    try {
      const {data}=await axios.get(`${chatService}/api/v1/chat/all`,{
        headers:{
          Authorization:`Bearer ${token}`,
        },
      })
      setChats(data.chats);
    } catch (error) {
      
    }
  }
  const [users, setUsers]=useState<User[] | null>(null)
  async function fetchUsers(){
    const token=Cookies.get("token");
    try {
      const {data}=await axios.get(`${userService}/api/v1/users/all-users`,{
        headers:{
          Authorization:`Bearer ${token}`,
        },
      })
      setUsers(data.user);
    } catch (error) {
      
    }
  }
  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, loading, setLoading, logoutUser,fetchUsers,fetchChats,chats, users,setChats}}
    >
      {children}
      <Toaster/>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
