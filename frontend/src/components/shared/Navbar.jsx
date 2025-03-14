import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.response?.data?.message || 'Logout failed');
        }
    };

    return (
        <div className='bg-white shadow-sm'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <Link to="/">
                    <h1 className='text-2xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1>
                </Link>

                <div className='flex items-center gap-8'>
                    <nav className='hidden md:block'>
                        <ul className='flex font-medium items-center gap-6'>
                            {user?.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies" className='hover:text-[#6A38C2] transition-colors'>Companies</Link></li>
                                    <li><Link to="/admin/jobs" className='hover:text-[#6A38C2] transition-colors'>Jobs</Link></li>
                                    <li><Link to={`/company/${user.company_id}`} className='hover:text-[#6A38C2] transition-colors'>My Company</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className='hover:text-[#6A38C2] transition-colors'>Home</Link></li>
                                    <li><Link to="/jobs" className='hover:text-[#6A38C2] transition-colors'>Jobs</Link></li>
                                    <li><Link to="/browse" className='hover:text-[#6A38C2] transition-colors'>Browse</Link></li>
                                </>
                            )}
                        </ul>
                    </nav>

                    {!user ? (
                        <div className='flex items-center gap-3'>
                            <Link to="/login"><Button variant="outline">Login</Button></Link>
                            <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer border-2 border-[#6A38C2]">
                                    <AvatarImage src={user.profile_photo || "https://github.com/shadcn.png"} />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-60">
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-3'>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.profile_photo} />
                                        </Avatar>
                                        <div>
                                            <h4 className='font-medium truncate'>{user.fullname}</h4>
                                            <p className='text-xs text-muted-foreground'>{user.role}</p>
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        {user.role === 'student' && (
                                            <Button asChild variant="ghost" className='w-full justify-start gap-2'>
                                                <Link to="/profile">
                                                    <User2 className='h-4 w-4' />
                                                    Profile
                                                </Link>
                                            </Button>
                                        )}
                                        <Button
                                            onClick={logoutHandler}
                                            variant="ghost"
                                            className='w-full justify-start gap-2 text-red-600 hover:text-red-700'
                                        >
                                            <LogOut className='h-4 w-4' />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;