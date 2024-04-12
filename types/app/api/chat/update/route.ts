import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        // 用户ID通过请求头'X-User-ID'提供
        const userId = request.headers.get('X-User-ID');
        if (!userId) {
            return NextResponse.json({ code: 401, message: 'Unauthorized: User ID is missing.' });
        }
        // 首先验证chat是否存在并且属于当前用户
        const chat = await prisma.chat.findFirst({
            where: {
                id: id,
                userId: userId,
            }
        });
        if (!chat) {
            return NextResponse.json({ code: 403, message: 'Forbidden: You do not have permission to update this chat.' });
        }
        // 更新chat信息
        await prisma.chat.update({
            data,
            where: {
                id: id,
            }
        });

        return NextResponse.json({ code: 0 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ code: 500, message: 'Internal Server Error' });
    }
}
