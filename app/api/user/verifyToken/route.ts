import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest, res: NextResponse) {
	try {
		const { token } = await request.json();
		if (!token) {
			return new NextResponse(JSON.stringify({ message: 'Token is required', isValid: false }), {
				status: 400,
				headers: {'Content-Type': 'application/json',},
			});
		}

		// 使用同步方式验证token
		let decoded;
		try {
			decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
		} catch (error) {
			// 处理验证失败的情况
			return new NextResponse(JSON.stringify({ message: 'Invalid or expired token', isValid: false }), {
				status: 401,
				headers: {'Content-Type': 'application/json',},
			});
		}
		// Token有效，刷新有效期
		const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '7d' }); // 重新生成token，有效期7天
		await prisma.user.update({
			where: { id: decoded.id },
			data: {
				token: newToken,
				tokenUpdateTime: new Date(), // 更新token更新时间
			},
		});

		// token验证成功
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
		});
		if (!user) {
			return new NextResponse(JSON.stringify({ message: 'User not found', isValid: false }), {
				status: 404,
				headers: {'Content-Type': 'application/json',}
			});
		}
		return new NextResponse(JSON.stringify({ isValid: true, newToken, user_uuid: user.id }), {
			status: 200,
			headers: {'Content-Type': 'application/json',},
		});
	} catch (error) {
		console.error('Error verifying token:', error);
		return new NextResponse(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: {'Content-Type': 'application/json',},
		});
	}
}
