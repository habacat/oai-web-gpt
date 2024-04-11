import React, { useState } from 'react';
import Head from 'next/head';
import 'tailwindcss/tailwind.css';
import Cookie from 'js-cookie';
import useAutoLogin from "@/components/home/Login/AutoVarify";
import { useAppContext } from '@/components/AppContext';
import { ActionType } from '@/reducers/AppReducer';

const LoginPage: React.FC = () => {
	useAutoLogin();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [accesscode, setAccesscode] = useState('');
	const [isEnteringPassword, setIsEnteringPassword] = useState(false);
	const [isEnteringAccesscode, setIsEnteringAccesscode] = useState(false);
	const [error, setError] = useState('');
	const [usernameFocused, setUsernameFocused] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [accesscodeFocused, setAccesscodeFocused] = useState(false);
	const { dispatch } = useAppContext(); // 移动到组件顶层

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
		setError(''); // 清除错误信息
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		setError(''); // 清除错误信息
	};

	const handleAccesscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAccesscode(e.target.value);
		setError(''); // 清除错误信息
	};


	// password字段可为空
	const login = async (username: string, password: any, accessCode: string) => {
		const loginEndpoint = '/api/user/login';
		try {
			const response = await fetch(loginEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + accessCode,
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				const jsonResponse = await response.json() || {};
				const errors = jsonResponse.message;
				throw new Error(`${errors}`);
			}

			const { token, expiresIn, user_uuid } = await response.json();

			// 处理成功响应，保存token到cookie
			// expiresIn是以秒为单位的过期时间
			Cookie.set('token', token, { expires: expiresIn / 86400 });
			Cookie.set('user_uuid', user_uuid, { expires: expiresIn / 86400 });

			// 登录成功后的操作，例如页面跳转
			console.log('登录成功');
			dispatch({
				type: ActionType.UPDATE,
				field: 'userLoggedIn',
				value: true,
			});
			dispatch({
				type: ActionType.UPDATE,
				field: 'user_uuid',
				value: user_uuid,
			});

		} catch (error) {
			// 处理登录错误
			console.error('登录错误:', error);
			setError(`登录失败，请重试 ${error}`);
		}
	};

	const handleSubmit = () => {
		if (!isEnteringPassword && !isEnteringAccesscode) {
			if (!username) {
				setError('用户名不能为空');
				return;
			}
			setIsEnteringPassword(true);
			setError('');
		} else if (isEnteringPassword && !isEnteringAccesscode) {
			setIsEnteringPassword(false);
			setIsEnteringAccesscode(true);
			setError('');
		} else {
			// 执行登录逻辑
			login(username, password, accesscode);
		}
	};


	return (
		<>
			<Head>
				<title>Login</title>
			</Head>
			<div className="flex flex-col justify-center h-screen items-center bg-gray-100">
				<div className="w-full max-w-xs">
					<div className='-mt-5 text-6xl font-sans font-extrabold text-center text-[rgba(255,255,255,0.5)] select-none'>CLOSE AI</div>
					<form className="mt-5 flex-col bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-[5rem] w-xs">
						<div className="mt-5 mb-5 text-3xl text-center font-sans font-extrabold text-oaidarkgray2 select-none">
							欢迎回来
						</div>
						<div className='text-xs text-oaigray2 text-center select-none'>登录/注册</div>
						{/* 用户名输入 */}
						{!isEnteringPassword && !isEnteringAccesscode && (
							<div className="px-6 pt-4 pb-8 select-none">
								<input
									id="username"
									type="text"
									onFocus={() => setUsernameFocused(true)}
									onBlur={() => setUsernameFocused(false)}
									value={username}
									onChange={handleUsernameChange}
									placeholder={usernameFocused ? '' : '请输入用户名'}
									className="appearance-none border border-[#c4c8d0] shadow-none rounded w-[full] py-2 px-3 text-oaitextblack leading-tight focus:outline-none focus:border-oaigreen select-none"
									autoComplete="off"
								/>
								{usernameFocused ? (
									<label htmlFor="username"
										className="relative top-[-3.2rem] left-[0.25rem] text-xs text-oaigreen font-sans" >
										请输入用户名
									</label>
								) : (
									<label htmlFor="username"
										className="relative top-[-3rem] left-[0.25rem]">
										&nbsp;
									</label>
								)
								}
							</div>
							
						)}
						{/* 密码输入 */}
						{isEnteringPassword && !isEnteringAccesscode && (
							<div className="px-6 pt-4 pb-8 select-none">
								<input
									id="password"
									type="password"
									value={password}
									onChange={handlePasswordChange}
									onFocus={() => setPasswordFocused(true)}
									onBlur={() => setPasswordFocused(false)}
									placeholder={passwordFocused ? '' : '密码可为空'}
									className="appearance-none border border-[#c4c8d0] shadow-none rounded w-[full] py-2 px-3 text-oaitextblack leading-tight focus:outline-none focus:border-oaigreen select-none"
									autoComplete="off"
								/>
								{passwordFocused ? (
									<label htmlFor="password"
										className="relative top-[-3.2rem] left-[0.25rem] text-xs text-oaigreen font-sans" >
										密码可为空
									</label>
								) : (
									<label htmlFor="password"
										className="relative top-[-3rem] left-[0.25rem] select-none">
										&nbsp;
									</label>
								)
								}
							</div>
						)}
						{/* AccessCode输入 */}
						{isEnteringAccesscode && !isEnteringPassword && (
							<div className="px-6 pt-4 pb-8 select-none">
								<input
									id="accesscode"
									type="accesscode"
									value={accesscode}
									onChange={handleAccesscodeChange}
									onFocus={() => setAccesscodeFocused(true)}
									onBlur={() => setAccesscodeFocused(false)}
									placeholder={accesscodeFocused ? '' : '请输入访问码'}
									className="appearance-none border border-[#c4c8d0] shadow-none rounded w-[full] py-2 px-3 text-oaitextblack leading-tight focus:outline-none focus:border-oaigreen select-none"
									autoComplete="off"
								/>
								{accesscodeFocused ? (
									<label htmlFor="accesscode"
										className="relative top-[-3.2rem] left-[0.25rem] text-xs text-oaigreen font-sans" >
										请输入访问码
									</label>
								) : (
									<label htmlFor="accesscode"
										className="relative top-[-3rem] left-[0.25rem] select-none">
										&nbsp;
									</label>
								)
								}
							</div>
						)}
						<div className='-mt-12 text-xs text-oaigray2 text-center select-none'>&nbsp;</div>
						{error && (
							<div className="relative mt-0 text-red-500 text-sm text-center">{error}</div>
						)}
						<div className="flex items-center justify-center select-none">
							<button
								onClick={handleSubmit}
								className="mt-0 bg-oaigreen hover:shadow-inset cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
								{isEnteringPassword ? '登录' : '下一步'}
							</button>
						</div>
					</form>
				</div>
				<footer className="relative w-[30%] text-center text-oaigreen2 text-xs select-none">
					<hr className='mb-2' />
					©2024 秋声 - FREE LLM FOR EDU
				</footer>
				<footer className="text-oaigreen2 text-xs mt-1 select-none"><a href="https://openai.com/policies/terms-of-use" target='_blank'>使用条款</a>
					<span className="separator select-none"> | </span><a href="https://openai.com/policies/privacy-policy" target='_blank'>隐私政策</a>
				</footer>
			</div>
			<style jsx>{`
				input:focus + label,
				label:active {
					transform: translateY(1.5rem) translateX(0.25rem);
					background-color: white;
					padding: 0 5px;
					font-size: 0.75rem;
					animation: change .3s;
				}

				@keyframes change {
					0% {
						opacity: 0;
					}
					50% {
						opacity: 0.8;
					}
					100% {
						opacity: 1;
					}
				}
			`}</style>

		</>
	);
};

export default LoginPage;

