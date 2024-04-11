import { useAppContext } from "@/components/AppContext"
import Button from "@/components/common/Button"
import { ActionType } from "@/reducers/AppReducer"
import { MdLightMode, MdDarkMode, MdInfo } from "react-icons/md"

export default function Toolbar() {
    const {
        state: { themeMode },
        dispatch
    } = useAppContext()
    return (
        <div className='absolute bottom-0 left-0 right-0 bg-oaiwhite dark:bg-oaidarkgray flex p-2 justify-between'>
            <Button className="text-oaigray2 hover:text-oaiblack dark:hover:text-oaigray"
                icon={themeMode === "dark" ? MdDarkMode : MdLightMode}
                variant='text'
                onClick={() => {
                    dispatch({
                        type: ActionType.UPDATE,
                        field: "themeMode",
                        value: themeMode === "dark" ? "light" : "dark"
                    })
                }}
            />
            <Button className="text-oaigray2 hover:text-oaiblack dark:hover:text-oaigray "
                icon={MdInfo}
                variant='text'
            />
        </div>
    )
}
