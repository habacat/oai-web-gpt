import { memo, useState, useEffect } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { PiClipboard } from 'react-icons/pi';
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'


function Markdown({ children, className = "", ...props }: Options) {
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null; // 明确指定timer的类型
        if (copySuccess) {
            timer = setTimeout(() => {
                setCopySuccess(false);
            }, 1500);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [copySuccess]);

    return (
        <ReactMarkdown
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                        <>
                            <div className="group pl-4 language-bar transition duration-300 ease-in bg-oaigray dark:bg-oaidarkgray hover:bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-amber-300 dark:hover:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700 dark:hover:text-gray-100">
                                Language:&nbsp;
                                <span className='text-red-500 group-hover:text-inherit font-bold dart:text-inherit'>
                                    {match[1]}
                                </span>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <SyntaxHighlighter
                                    style={a11yDark}
                                    language={match?.[1] ?? ""}
                                    PreTag="div"
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                                <div className='absolute top-0 right-0 p-2'>
                                    {copySuccess ? (
                                        <span className='mr-2 text-oaigray2 font-bold cursor-default text-right select-none'>
                                            Copied!
                                        </span>
                                    ) : (
                                        <CopyToClipboard text={String(children).replace(/\n$/, "")}
                                                onCopy={() => setCopySuccess(true)}>
                                                <div id="copy" className='group'>
                                                    <button className='flex mr-2 text-oaigray2 tracking-tight group-hover:font-bold text-right select-none'
                                                        style={{ cursor: 'pointer' }}>
                                                        <div>
                                                            <PiClipboard className='-mt-0.5 inline text-oaigray2 group-hover:text-oaigray select-none cursor-pointer' />
                                                            <span className='ml-1 inline-block'>Copy</span>
                                                            <span className='w-[0.18rem] inline-block'></span>
                                                            <span>code</span>
                                                        </div>
                                                    </button>
                                                </div>
                                        </CopyToClipboard>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <code {...props} className={className}>
                            {children}
                        </code>
                    );
                }
            }}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className={`markdown prose dark:prose-invert ${className}`}
            {...props}
        >
            {children}
        </ReactMarkdown>
    );
}

export default memo(Markdown);
