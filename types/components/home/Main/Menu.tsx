"use client"
import { useState, useEffect } from 'react';
import { useAppContext } from "@/components/AppContext"
import Button from "@/components/common/Button"
import { ActionType } from "@/reducers/AppReducer"
import { LuPanelLeft } from "react-icons/lu"

export default function Menu() {
    const {
        state: { displayNavigation },
        dispatch
    } = useAppContext()

    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (!displayNavigation) {
            const timer = setTimeout(() => {
                setShowButton(true);
            }, 100); // 开始显示的延迟
            return () => clearTimeout(timer);
        } else {
            setShowButton(false);
        }
    }, [displayNavigation]);

    return (
        <Button
            icon={LuPanelLeft}
            className={`${showButton ? 'opacity-200 transition-opacity duration-200' : 'opacity-0'} fixed left-2 top-2`}
            variant='outline'
            onClick={() => {
                dispatch({
                    type: ActionType.UPDATE,
                    field: "displayNavigation",
                    value: true
                })
            }}
        />
    )
}