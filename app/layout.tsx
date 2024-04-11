import AppContextProvider from "@/components/AppContext"
import EventBusContextProvider from "@/components/EventBusContext"
import "@/styles/globals.css"
import "@/styles/markdown.css"

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <body>
                <AppContextProvider>
                    <EventBusContextProvider>
                        {children}
                    </EventBusContextProvider>
                </AppContextProvider>
            </body>
        </html>
    )
}
