import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { backendUrl } from '../App';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // التحقق من وجود توكن عند تحميل المكون
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            setToken(tokenFromUrl);
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/add', { replace: true });
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken && storedToken !== '') {
                setToken(storedToken);
                navigate('/add', { replace: true });
            }
        }
    }, [setToken, navigate]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/login`, {
                email,
                password,
            });

            // سجل الاستجابة للتحقق منها
            console.log('API Response:', response.data);

            if (response.data.data?.token || response.data.message === 'login success') {
                const token = response.data.data?.token;
                const redirect = response.data.data?.redirect;

                // سجل قيمة redirect للتحقق
                console.log('Redirect Value:', redirect);

                // التحقق من أن redirect موجود ويحتوي على القيمة الصحيحة
                if (!redirect || redirect !== 'dashboard/admin') {
                    toast.error('غير مسموح لك بالدخول إلى لوحة الإدارة', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }

                setToken(token);
                localStorage.setItem('token', token);
                toast.success('تم تسجيل الدخول بنجاح!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    navigate('/add', { replace: true });
                }, 1000);
            } else {
                toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.log('Error:', error.response?.data || error.message);
            toast.error('خطأ أثناء تسجيل الدخول', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                <h1 className='text-2xl font-bold mb-4'>لوحة الإدارة</h1>
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>البريد الإلكتروني</p>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type='email'
                            placeholder='your@email.com'
                            required
                        />
                    </div>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>كلمة المرور</p>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type='password'
                            placeholder='أدخل كلمة المرور'
                            required
                        />
                    </div>
                    <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type='submit'>
                        تسجيل الدخول
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;