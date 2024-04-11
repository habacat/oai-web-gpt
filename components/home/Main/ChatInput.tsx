import Button from "@/components/common/Button"
import { MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useEffect, useRef, useState } from "react"
import { Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext, EventListener } from "@/components/EventBusContext"

export default function ChatInput() {
    const [messageText, setMessageText] = useState("")
    const stopRef = useRef(false)
    const chatIdRef = useRef("")
    const {
        state: { messageList, currentModel, streamingId, selectedChat, userLoggedIn, user_uuid },
        dispatch
    } = useAppContext()
    const { publish, subscribe, unsubscribe } = useEventBusContext()

    useEffect(() => {
        const callback: EventListener = (data) => {
            send(data)
        }
        subscribe("createNewChat", callback)
        return () => unsubscribe("createNewChat", callback)
    }, [send, unsubscribe, subscribe])

    useEffect(() => {
        if (chatIdRef.current === selectedChat?.id) {
            return
        }
        chatIdRef.current = selectedChat?.id ?? ""
        stopRef.current = true
    }, [selectedChat])

    async function createOrUpdateMessage(message: Message) {
        try {const response = await fetch("/api/message/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-ID": `${user_uuid}`,
                    "X-User-Logged-In": `${userLoggedIn}`
                },
                body: JSON.stringify(message)
            })
            if (!response.ok) {
                console.log(response.statusText)
                return
            }
            const { data } = await response.json()
            if (!chatIdRef.current) {
                chatIdRef.current = data.message.chatId
                publish("fetchChatList")
                dispatch({
                    type: ActionType.UPDATE,
                    field: "selectedChat",
                    value: { id: chatIdRef.current }
                })
            }
            return data.message
        } catch (error: any) {
            if (error.message.includes("missing role")) {
                // 特定错误，选择不记录或处理
                console.log("Encountered a known error, but it's okay.");
            } else {
                // 其他错误，正常记录或抛出
                console.error("Error calling OpenAI:", error);
            }
        }
    }

    async function deleteMessage(id: string) {
        const response = await fetch(`/api/message/delete?id=${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-ID": `${user_uuid}`,
                "X-User-Logged-In": `${userLoggedIn}`
            },
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        const { code } = await response.json()
        return code === 0
    }

    async function send(content: string) {
        const message = await createOrUpdateMessage({
            id: "",
            role: "user",
            content,
            chatId: chatIdRef.current
        })
        if (!message) {
            return
        }
        dispatch({ type: ActionType.ADD_MESSAGE, message })
        const messages = messageList.concat([message])
        doSend(messages)

        if (!selectedChat?.title || selectedChat.title === "新对话") {
            updateChatTitle(messages)
        }
    }

    async function updateChatTitle(messages: Message[]) {
        try {
            const message: Message = {
                id: "",
                role: "user",
                content:
                    "使用 5 到 10 个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，如果没有主题，请直接返回'新对话'",
                chatId: chatIdRef.current
            }
            const chatId = chatIdRef.current
            const body: MessageRequestBody = {
                messages: [...messages, message],
                model: "gpt-3.5-turbo",
            }
            let response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-ID": `${user_uuid}`,
                    "X-User-Logged-In": `${userLoggedIn}`
                },
                body: JSON.stringify(body)
            })
            if (!response.ok) {
                console.log(response.statusText)
                return
            }
            if (!response.body) {
                console.log("body error")
                return
            }
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            // 设置title为当前的时间
            let title = new Date().toLocaleString()
            let title_reset = false
            while (!done) {
                const result = await reader.read()
                done = result.done
                const chunk = decoder.decode(result.value) || ""
                if (chunk && !title_reset) {
                    title_reset = true
                    title = ""
                }
                title += chunk
            }
            response = await fetch("/api/chat/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-ID": `${user_uuid}`,
                    "X-User-Logged-In": `${userLoggedIn}`
                },
                body: JSON.stringify({ id: chatId, title })
            })
            if (!response.ok) {
                console.log(response.statusText)
                return
            }
            const { code } = await response.json()
            if (code === 0) {
                publish("fetchChatList")
            }
        } catch (error: any) {
            if (error.message.includes("missing role")) {
                // 特定错误，选择不记录或处理
                console.log("Encountered a known error, but it's okay.");
            } else {
                // 其他错误，正常记录或抛出
                console.error("Error calling OpenAI:", error);
            }
        }
    }

    async function resend() {
        const messages = [...messageList]
        if (
            messages.length !== 0 &&
            messages[messages.length - 1].role === "assistant"
        ) {
            const result = await deleteMessage(messages[messages.length - 1].id)
            if (!result) {
                console.log("delete error")
                return
            }
            dispatch({
                type: ActionType.REMOVE_MESSAGE,
                message: messages[messages.length - 1]
            })
            messages.splice(messages.length - 1, 1)
        }
        doSend(messages)
    }

    async function doSend(messages: Message[]) {
        stopRef.current = false
        const body: MessageRequestBody = { messages, model: currentModel }
        setMessageText("")
        const controller = new AbortController()
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-ID": `${user_uuid}`,
                "X-User-Logged-In": `${userLoggedIn}`
            },
            signal: controller.signal,
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        if (!response.body) {
            console.log("body error")
            return
        }
        const responseMessage: Message = await createOrUpdateMessage({
            id: "",
            role: "assistant",
            content: "",
            chatId: chatIdRef.current
        })
        if (!responseMessage) {
            controller.abort()
            return
        }
        dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: responseMessage.id
        })
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let content = ""
        while (!done) {
            if (stopRef.current) {
                controller.abort()
                break
            }
            const result = await reader.read()
            done = result.done
            const chunk = decoder.decode(result.value)
            content += chunk
            dispatch({
                type: ActionType.UPDATE_MESSAGE,
                message: { ...responseMessage, content }
            })
        }
        createOrUpdateMessage({ ...responseMessage, content })
        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: ""
        })
    }

    return (
        <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(0,0,0,0)] dark:to-oaidarkgray dark:to-[58.85%]'>
            <div className='w-full max-w-3xl mx-auto flex flex-col items-center px-4 space-y-2'>
                {messageList.length !== 0 &&
                    (streamingId !== "" ? (
                        <Button
                            icon={PiStopBold}
                            variant='primary'
                            onClick={() => {
                                stopRef.current = true
                            }}
                            className='font-medium'
                        >
                            停止生成
                        </Button>
                    ) : (
                        <Button
                            icon={MdRefresh}
                            variant='primary'
                            onClick={() => {
                                resend()
                            }}
                            className='font-medium'
                        >
                            重新生成
                        </Button>
                    ))}
                <div className='flex items-end w-full border border-oaigray dark:border-oaigray2 bg-white dark:bg-oaidarkgray2 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-1'>
                    <div className='mx-3 text-primary-500 m-2'>
                        <PiLightningFill className="mb-0.5" />
                    </div>
                    <TextareaAutoSize
                        className='outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-oaitextblack dark:text-white resize-none border-0'
                        placeholder='输入一条消息...'
                        rows={1}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            // 检查是否按下了Enter键而没有同时按下Ctrl键或Shift键
                            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                                e.preventDefault(); // 阻止默认行为，即不换行
                                if (messageText.trim() !== "" && streamingId === "") {
                                    send(messageText);
                                }
                            }
                        }}
                    />
                    <Button
                        className='mx-3 !rounded-lg'
                        icon={FiSend}
                        disabled={messageText.trim() === "" || streamingId !== ""}
                        variant='primary'
                        onClick={() => send(messageText)}
                    />
                </div>

                <footer className='text-center text-sm text-oaigray2 dark:text-oaigray2 px-4 pb-4'>
                    ©️{new Date().getFullYear()}&nbsp;{" "}
                    <a
                        className='font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0 animated-underline'
                        href='https://afdian.net/a/habacat'
                        target='_blank'
                    >
                        Designed by 秋声
                    </a>
                    .&nbsp;|&nbsp;Free LLM for EDU
                </footer>
            </div>
        </div>
    )
}
