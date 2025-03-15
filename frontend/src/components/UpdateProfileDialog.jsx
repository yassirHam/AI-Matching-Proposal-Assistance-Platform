import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        bio: user?.bio || "",
        skills: user?.skills?.join(', ') || "", // Convert array to comma-separated string
        resume: null
    });

    const handleInputChange = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setInput({ ...input, resume: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Append all fields
        formData.append('fullname', input.fullname);
        formData.append('email', input.email);
        formData.append('phone_number', input.phone_number);
        formData.append('bio', input.bio);
        formData.append('skills', input.skills);

        if (input.resume) {
            formData.append('resume', input.resume);
        }

        try {
            setLoading(true);
            const { data } = await axios.put(
                `${USER_API_END_POINT}/profile/update`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token
                    },
                    withCredentials: true
                }
            );

            if (data.success) {
                dispatch(setUser(data.user));
                toast.success('Profile updated successfully');
                setOpen(false);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Update failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Full Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fullname" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="fullname"
                                name="fullname"
                                value={input.fullname}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={input.email}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone_number" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={input.phone_number}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>

                        {/* Bio */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bio" className="text-right">
                                Bio
                            </Label>
                            <Input
                                id="bio"
                                name="bio"
                                value={input.bio}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>

                        {/* Skills */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="skills" className="text-right">
                                Skills
                            </Label>
                            <Input
                                id="skills"
                                name="skills"
                                value={input.skills}
                                onChange={handleInputChange}
                                placeholder="Comma-separated list"
                                className="col-span-3"
                            />
                        </div>

                        {/* Resume Upload */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="resume" className="text-right">
                                Resume
                            </Label>
                            <Input
                                id="resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;