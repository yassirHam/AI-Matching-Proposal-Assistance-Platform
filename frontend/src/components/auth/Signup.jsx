import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import  USER_API_END_POINT from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phone_number: "",
        password: "",
        role: "",
        file: null
    });

    const [errors, setErrors] = useState({});
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

        if (!input.fullname.trim()) newErrors.fullname = "Full name is required";
        if (!emailRegex.test(input.email)) newErrors.email = "Invalid email format";
        if (!phoneRegex.test(input.phone_number)) newErrors.phone_number = "Invalid phone number (10 digits required)";
        if (!passwordRegex.test(input.password)) newErrors.password = "Password must be at least 8 characters with letters and numbers";
        if (!input.role) newErrors.role = "Role selection is required";
        if (!input.file) newErrors.file = "Profile photo is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phone_number", input.phone_number);
        formData.append("password", input.password);
        formData.append("role", input.role);
        formData.append("profile_photo", input.file);

        try {
            dispatch(setLoading(true));
            const response =axios.post(
  `${import.meta.env.VITE_API_BASE}/api/v1/users/register`,
  formData,
  {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true,
                timeout: 10000
            });

            if (response.data.success) {
                toast.success("Registration successful! Please login");
                navigate("/login");
                setInput({  // Reset form
                    fullname: "",
                    email: "",
                    phone_number: "",
                    password: "",
                    role: "",
                    file: null
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                               error.message ||
                               "Registration failed. Please try again.";
            toast.error(errorMessage);
            console.error("Registration Error:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={handleSubmit} className='w-full md:w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Sign Up</h1>

                    {/* Form Fields */}
                    <div className='space-y-4'>
                        {/* Full Name */}
                        <div>
                            <Label>Full Name *</Label>
                            <Input
                                type="text"
                                name="fullname"
                                value={input.fullname}
                                onChange={(e) => setInput({...input, fullname: e.target.value})}
                                className={errors.fullname ? 'border-red-500' : ''}
                            />
                            {errors.fullname && <span className="text-red-500 text-sm">{errors.fullname}</span>}
                        </div>

                        {/* Email */}
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={(e) => setInput({...input, email: e.target.value})}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <Label>Phone Number *</Label>
                            <Input
                                type="tel"
                                name="phone_number"
                                value={input.phone_number}
                                onChange={(e) => setInput({...input, phone_number: e.target.value})}
                                className={errors.phone_number ? 'border-red-500' : ''}
                            />
                            {errors.phone_number && <span className="text-red-500 text-sm">{errors.phone_number}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={(e) => setInput({...input, password: e.target.value})}
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
                                        checked={input.role === 'student'}
                                        onChange={(e) => setInput({...input, role: e.target.value})}
                                        className="cursor-pointer"
                                    />
                                    <Label>Student</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value="recruiter"
                                        checked={input.role === 'recruiter'}
                                        onChange={(e) => setInput({...input, role: e.target.value})}
                                        className="cursor-pointer"
                                    />
                                    <Label>Recruiter</Label>
                                </div>
                            </RadioGroup>
                            {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
                        </div>

                        {/* Profile Photo */}
                        <div>
                            <Label>Profile Photo *</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setInput({...input, file: e.target.files[0]})}
                                className={`cursor-pointer ${errors.file ? 'border-red-500' : ''}`}
                            />
                            {errors.file && <span className="text-red-500 text-sm">{errors.file}</span>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        {loading ? (
                            <Button className="w-full" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        )}
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-sm">
                            Already have an account? {' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;