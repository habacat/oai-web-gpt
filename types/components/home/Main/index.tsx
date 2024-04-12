"use client"

import { useAppContext } from "@/components/AppContext"
import ChatInput from "./ChatInput"
import Menu from "./Menu"
import MessageList from "./MessageList"
import Welcome from "./Welcome"

export default function Main() {
    const {
        state: { selectedChat }
    } = useAppContext()
    return (
        <div className='flex-1 relative'>
            <main className='overflow-y-auto w-full h-full bg-white text-oaitextblack dark:bg-oaidarkgray dark:text-oaigray'>
                <Menu />
                {!selectedChat && <Welcome />}
                <MessageList />
                <ChatInput />
            </main>
        </div>
    )
}
