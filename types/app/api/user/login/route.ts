import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';



// 生成JWT Token的函数
const generateToken = (userId: string) => {
	return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' }); // 设置token有效期为7天
};

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();
		// 检查Authentication中的accesscode是否正确
		if (!request.headers.get('Authorization')) {
			return new Response(JSON.stringify({ message: 'Access code is required' }), {
				status: 401,
				headers: {'Content-Type': 'application/json',}
			})}
		if (request.headers.get('Authorization') !== 'Bearer ' + process.env.ACCESS_CODE) {
			return new Response(JSON.stringify({ message: 'Invalid access code' }), {
				status: 401,
				headers: {'Content-Type': 'application/json',},
			})}

		if (!username) {
			return new Response(JSON.stringify({ message: 'Username is required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});}

		let user = await prisma.user.findUnique({
			where: {
				name: username,
			},
		});

		if (!user) {
			// 用户不存在，自动注册
			const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
			user = await prisma.user.create({
				data: {
					name: username,
					password: hashedPassword,
				},
			});
		} else if (user.password && password) {
			// 用户存在且提交了密码，验证密码
			const isPasswordValid = bcrypt.compareSync(password, user.password);
			if (!isPasswordValid) {
				return new Response(JSON.stringify({ message: 'Invalid password' }), {
					status: 401,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
		} else if (user.password && !password) {
			// 用户存在但未提交密码
			return new Response(JSON.stringify({ message: 'Password is required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		// 生成Token
		const token = generateToken(user.id);

		// 更新用户的token和tokenUpdateTime
		await prisma.user.update({
			where: { id: user.id },
			data: {
				token: token,
				tokenUpdateTime: new Date(),
			},
		});

		// 返回token
		return new Response(JSON.stringify({ message: 'Success', token: token, user_uuid:user.id }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}
