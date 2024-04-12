import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ code: -1, message: 'Missing chat ID.' });
    }

    const userId = request.headers.get('X-User-ID');
    if (!userId) {
        return NextResponse.json({ code: 401, message: 'Unauthorized: User ID is missing.' });
    }

    // 验证chat是否存在并且属于当前用户
    const chat = await prisma.chat.findFirst({
        where: {
            id: id,
            userId: userId,
        }
    });
    if (!chat) {// 如果chat不存在或不属于该用户，则返回403禁止访问
        return NextResponse.json({ code: 403, message: 'Forbidden: You do not have permission to delete this chat.' });
    }
    // 如果验证通过，则执行删除操作
    const deleteMessages = prisma.message.deleteMany({
        where: {
            chatId: id
        }
    });
    const deleteChat = prisma.chat.delete({
        where: {
            id
        }
    });
    await prisma.$transaction([deleteMessages, deleteChat]);
    return NextResponse.json({ code: 0, message: 'Chat deleted successfully.' });
}
