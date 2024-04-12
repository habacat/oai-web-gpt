import { ComponentPropsWithoutRef } from "react"
import { IconType } from "react-icons"

type ButtonProps = {
    icon?: IconType
    variant?: "default" | "outline" | "text" | "primary"
} & ComponentPropsWithoutRef<"button">

export default function Button({
    children,
    className = "",
    icon: Icon,
    variant = "default",
    ...props
}: ButtonProps) {
    return (
        <button
            className={`transition-colors inline-flex items-center min-w-[38px] min-h-[38px] rounded px-3 py-1.5 text-sm
            ${
                variant === "default"
                ? "text-oaiblack dark:text-oaiwhite bg-oaiwhite hover:bg-oaigray dark:bg-oaidarkgray2 dark:hover:bg-oaigray2"
                : variant === "outline"
                ? "border border-oaigray dark:border-oaidarkgray2 text-oaiblack dark:text-oaigray bg-oaiwhite hover:bg-oaigray dark:bg-oaidarkgray dark:hover:bg-oaidarkgray2"
                : variant === "primary"
                ? "bg-primary-500 text-oaiwhite hover:bg-primary-600 hover:text-oaiwhite shadow-sm disabled:shadow-none disabled:bg-transparent disabled:text-gray-300 dark:disabled:text-gray-600"
                : "text-black dark:text-oaigray2 bg-transparent hover:bg-oaigray dark:hover:bg-oaidarkgray2"
            }
            ${className}`}
            {...props}
        >
            {Icon && <Icon className={`text-lg ${children ? "mr-1" : ""}`} />}
            {children}
        </button>
    )
}
