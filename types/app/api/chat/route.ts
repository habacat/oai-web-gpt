import { sleep } from "@/common/util";
import openai from "@/lib/openai";
import { MessageRequestBody } from "@/types/chat";
import { NextRequest, } from "next/server";

export async function POST(request: NextRequest) {
    const { messages, model } = (await request.json()) as MessageRequestBody
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const stream = await openai.beta.chat.completions.stream({
                model: model,
                messages: [{ role: "system", content: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown." },
                            ...messages],
                stream: true,
            });

            for await (const chunk of stream) {
                controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ''))
            }

            const chatCompletion = await stream.finalChatCompletion();
            if (chatCompletion) {
                controller.close()
            } else {
                // 等待3分钟后close
                setTimeout(() => {
                    controller.close()
                }, 180000)
            }
        }
    })
    return new Response(stream)
}