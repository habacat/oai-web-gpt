import { useAppContext } from '@/components/AppContext';
import { ActionType } from '@/reducers/AppReducer';
import Cookie from 'js-cookie';
import { useEffect } from 'react';

const verifyTokenEndpoint = '/api/user/verifyToken';
const useAutoLogin = () => {
	const { dispatch } = useAppContext();
	useEffect(() => {
		const token = Cookie.get('token');
		const user_uuid = Cookie.get('user_uuid');
		if (token) {
			fetch(verifyTokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			})
				.then(response => response.json())
				.then(data => {
					if (data.isValid) {
						Cookie.set('token', data.newToken, { expires: 7 });
						Cookie.set('user_uuid', data.user_uuid, { expires: 7 });
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
					} else {
						// token无效或过期，则清除token
						Cookie.remove('token');
					}
				})
				.catch((error) => {
					console.error('Error verifying token:', error);
				});
		}
		// 如果没有token，什么也不做，用户将留在登录页面
	}, [dispatch]);
};

export default useAutoLogin;