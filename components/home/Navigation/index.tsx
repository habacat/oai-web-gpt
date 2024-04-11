"use client"

import { useAppContext } from "@/components/AppContext"
import Menubar from "./Menubar"
import Toolbar from "./Toolbar"
import ChatList from "./ChatList"
import SidebarButton from "./SidebarButton"
import { SiD } from "react-icons/si"

export default function Navigation() {
    const {
        state: { displayNavigation }
    } = useAppContext()
    return (
        <nav
            className={`flex flex-col bg-slate-50 text-oaitextblack relative h-full w-[260px] dark:bg-oaiblack
                       dark:text-oaitextwhite p-2 transition-transform duration-300 ease-out
                       ${displayNavigation ? "translate-x-0" : "hidden"}`
            }
        >
            <Menubar />
            <ChatList />
            <Toolbar />
            {/* <SidebarButton /> */}
        </nav>
    )
}

