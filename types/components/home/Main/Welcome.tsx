import Example from "./Example"
import ModelSelect from "./ModelSelect"

export default function Welcome() {
    return (
        <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-20'>
            <ModelSelect />
            <h1>
                <span className='welcome-h1-main block text-center mt-20 text-8xl font-bold select-none tracking-wide'>
                    LLM
                </span>
                <span className="welcome-h1-sub block text-center relative top-3 text-3xl font-normal text-oaigray2 select-none">
                    FREE FOR EDU
                </span>
            </h1>
            
            <Example />
        </div>
    )
}
