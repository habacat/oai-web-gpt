import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        // 获取用户ID和用户登录状态
        // 用户ID通过请求头'X-User-ID'提供
        const userId = request.headers.get('X-User-ID');
        if (!userId) {
            return NextResponse.json({ code: 401, message: 'Unauthorized: User ID is missing.' });
        }

        // 检查用户存在
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ code: 404, message: 'User not found.' });
        }

        if (!data.chatId) {
            // 入不提供会话id则创建新会话
            const chat = await prisma.chat.create({
                data: {
                    title: "新对话",
                    userId, // 将当前用户设置为会话的所有者
                }
            });
            data.chatId = chat.id;
        } else {
            // 检查会话是否存在且属于当前用户
            const existingChat = await prisma.chat.findFirst({
                where: {
                    id: data.chatId,
                    userId: userId // 确保会话属于当前用户
                }
            });
            if (!existingChat) {
                return NextResponse.json({ code: 403, message: 'Forbidden: You do not have access to this chat.' });
            }

            // 更新会话的更新时间
            await prisma.chat.update({
                data: { updateTime: new Date() },
                where: { id: data.chatId }
            });
        }

        // 创建或更新消息
        const message = await prisma.message.upsert({
            create: data,
            update: data,
            where: { id },
        });

        return NextResponse.json({ code: 0, data: { message } });
    } catch (error) {
        console.error(error);
        // 返回一个通用的服务器错误响应
        return NextResponse.json({ code: 500, message: 'Internal Server Error' });
    }
}
