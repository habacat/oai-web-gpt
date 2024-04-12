import { useAppContext } from "@/components/AppContext"

export default function SidebarButton() {
	const {
		state: { themeMode },
		dispatch
	} = useAppContext()

	return (
		<div className="fixed left-0 top-1/2 z-40 transform translate-x-[260px] -translate-y-1/2 rotate-0 translate-z-0">
			<button>
				<span data-state="closed">
					<div className="flex h-[72px] w-8 items-center justify-center">
						<div className="flex h-6 w-6 flex-col items-center">
							<div
								className={`h-3 w-1 rounded-full transform translate-y-[0.15rem] rotate-0 translate-z-0 ${themeMode === 'dark' ? 'bg-oaigray' : 'bg-text-quaternary'
									}`}
							></div>
							<div
								className={`h-3 w-1 rounded-full transform -translate-y-[0.15rem] rotate-0 translate-z-0 ${themeMode === 'dark' ? 'bg-oaigray' : 'bg-text-quaternary'
									}`}
							></div>
						</div>
					</div>
					<span className="absolute border-0 w-px h-px p-0 m-[-1px] overflow-hidden clip-[0_0_0_0] whitespace-nowrap overflow-wrap-normal">
						Close sidebar
					</span>
				</span>
			</button>
		</div>
	)
}