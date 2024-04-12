"use client"
import Navigation from "@/components/home/Navigation"
import Main from "@/components/home/Main"
import { useAppContext } from "@/components/AppContext"
import LoginPage from "@/components/home/Login";

export default function Home() {
    const { state: { themeMode, userLoggedIn } } = useAppContext();
    if (!userLoggedIn) {
        return (
            <div className={`${themeMode} w-full h-full flex-center`}>
                <LoginPage />
            </div>
        );
    }
    return (
        <div className={`${themeMode} h-full flex`}>
            <Navigation />
            <Main />
        </div>
    );
}