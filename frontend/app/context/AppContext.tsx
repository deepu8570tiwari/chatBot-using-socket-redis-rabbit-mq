"use client"
export const userService="http://localhost:8090"
export const chatService="http://localhost:8091"

export interface User{
    _id:string;
    name:string;
    email:string;
}
export interface Chat{
    _id:string;
    users:string[],
    latestMessage:{
        text:string,
        sender:string
    };
    createdAt:string,
    updatedAt:string,
    unseenCount?:number
}
export interface Chats{
    _id:string;
    user:User;
    chat:Chat;
}