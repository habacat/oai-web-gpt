import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('X-User-ID'); // 假设用户ID通过请求头'X-User-ID'提供
        if (!userId) {
            return NextResponse.json({ code: 401, message: 'Unauthorized: User ID is missing.' });
        }

        const param = request.nextUrl.searchParams.get("page")
        // 将参数转换为数字类型，如果没有参数则默认获取第一页的数据
        const page = param ? parseInt(param, 10) : 1
        const perPage = 20;

        // 只获取属于该用户的chat
        const list = await prisma.chat.findMany({
            where: {
                userId: userId,
            },
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {
                updateTime: "desc"
            }
        });

        // 只计算属于该用户的chat总数
        const count = await prisma.chat.count({
            where: {
                userId: userId,
            }
        });

        const hasMore = count > page * perPage;
        return NextResponse.json({ code: 0, data: { list, hasMore } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ code: 500, message: 'Internal Server Error' });
    }
}
