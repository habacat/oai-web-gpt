import { useAppContext } from "@/components/AppContext"
import Markdown from "@/components/common/Markdown"
import { ActionType } from "@/reducers/AppReducer"
import { useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { PiClipboard } from "react-icons/pi"
import { SiOpenai } from "react-icons/si"
import { SlUserFollowing } from "react-icons/sl"
import { GrCheckmark } from 'react-icons/gr';

export default function MessageList() {
    const {
        state: { messageList, streamingId, selectedChat },
        dispatch
    } = useAppContext()

    async function getData(chatId: string) {
        const response = await fetch(`/api/message/list?chatId=${chatId}`, {
            method: "GET"
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        const { data } = await response.json()
        dispatch({
            type: ActionType.UPDATE,
            field: "messageList",
            value: data.list
        })
    }

    useEffect(() => {
        if (selectedChat) {
            getData(selectedChat.id)
        } else {
            dispatch({
                type: ActionType.UPDATE,
                field: "messageList",
                value: []
            })
        }
    }, [selectedChat, dispatch, getData])

    const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});

    return (
        <div className='w-full pt-10 pb-48 dark:text-oaiwhite'>
            <ul>
                {messageList.map((message) => {
                    const isUser = message.role === "user"
                    return (
                        <li
                            key={message.id}
                            className={`${
                                isUser ? "bg-white dark:bg-oaidarkgray"
                                       : "bg-gray-50 dark:bg-oaidarkgray3"
                            }`}
                        >
                            <div className='w-full max-w-[60%] mx-auto flex space-x-6 px-4 py-6 text-lg break-words'>
                                <div className='text-3xl leading-[1]'>
                                    {isUser ? <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-oaigray2">
                                                <SlUserFollowing className="text-oaigray2 text-2xl dark:text-oaiwhite" />
                                              </div>
                                            : <div className="flex items-center justify-center w-9 h-9 rounded-full bg-oaipurple">
                                                <SiOpenai className="text-white w-6 h-6" />
                                              </div>
                                    }
                                </div>
                                <div className="flex-col w-full">
                                    <div className="text-sm -mt-1 -ml-1 text-oaidarkgray2 dark:text-oaigray2 font-semibold uppercase mb-1.5 select-none">
                                        {message.role}
                                    </div>
                                    <div className='flex-1 text-base'>
                                        <Markdown>{`${message.content}${
                                            message.id === streamingId ? " ❍" : ""
                                            }`}</Markdown>
                                        {
                                            message.content ?
                                                <div className='relative top-0 right-0 p-2'>
                                                    {copySuccess[message.id] ? (
                                                        <GrCheckmark className="text-oaigray2 dark:text-oaigray text-sm cursor-default select-none" />
                                                    ) : (
                                                        <CopyToClipboard text={String(message.content).replace(/\n$/, "")}
                                                            onCopy={() => {
                                                                const newCopySuccess = { ...copySuccess, [message.id]: true };
                                                                setCopySuccess(newCopySuccess);
                                                                setTimeout(() => {
                                                                    setCopySuccess({ ...newCopySuccess, [message.id]: false });
                                                                }, 1500);
                                                            }}>
                                                            <PiClipboard className='text-oaiblack hover:text-black dark:text-oaigray2 dark:hover:text-oaigray2 dark:font-bold text-sm select-none cursor-pointer' />
                                                        </CopyToClipboard>
                                                    )}
                                                </div>
                                                : null
                                        }
                                    </div>
                                </div>
                                
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
