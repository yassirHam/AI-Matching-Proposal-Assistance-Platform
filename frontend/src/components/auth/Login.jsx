import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        role: ""
    });
    
    const [errors, setErrors] = useState({});
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(credentials.email)) newErrors.email = "Invalid email format";
        if (credentials.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (!credentials.role) newErrors.role = "Role selection is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        dispatch(setLoading(true));
        const response = await axios.post(`${USER_API_END_POINT}/login`, credentials, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true,
            timeout: 10000
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            dispatch(setUser(response.data.user));
            toast.success("Login successful!");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                               error.message ||
                               "Login failed. Please try again.";
            toast.error(errorMessage);
            console.error("Login Error:", error);

            setCredentials(prev => ({ ...prev, password: "" }));
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
    if (user && !loading) {
        navigate('/dashboard');
    }
}, [user, loading, navigate]);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={handleLogin} className='w-full md:w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>
                    
                    <div className='space-y-4'>
                        {/* Email */}
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                name="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <Label>Role *</Label>
                            <RadioGroup className="flex items-center gap-4 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        checked={credentials.role === 'student'}
                                        onChange={(e) => setCredentials({...credentials, role: e.target.value})}
                                        className="cursor-pointer"
                                    />
                                    <Label>Student</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value="recruiter"
                                        checked={credentials.role === 'recruiter'}
                                        onChange={(e) => setCredentials({...credentials, role: e.target.value})}
                                        className="cursor-pointer"
                                    />
                                    <Label>Recruiter</Label>
                                </div>
                            </RadioGroup>
                            {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        {loading ? (
                            <Button className="w-full" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        )}
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-sm">
                            Don't have an account? {' '}
                            <Link to="/signup" className="text-blue-600 hover:underline">
                                Sign Up
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;