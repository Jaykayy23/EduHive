import { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = {
    title: "Messages",
    description: "Chat with your friends and colleagues",
}

export default function Page(){
    return <Chat/>;
}