import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const CompanySetup = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        location: '',
        logo: null
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { companies } = useSelector(store => store.company);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(`${COMPANY_API_END_POINT}/${id}`, {
                    withCredentials: true
                });

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                setFormData({
                    name: response.data.company.name || '',
                    description: response.data.company.description || '',
                    website: response.data.company.website || '',
                    location: response.data.company.location || '',
                    logo: null
                });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load company');
                navigate('/admin/companies');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            logo: e.target.files?.[0] || null
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Company name is required');
            return false;
        }
        if (formData.description.length > 500) {
            toast.error('Description must be less than 500 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const formPayload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formPayload.append(key, value);
                }
            });

            const response = await axios.put(
                `${COMPANY_API_END_POINT}/${id}`,
                formPayload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success('Company updated successfully');
            navigate('/admin/companies');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-4">Loading company data...</div>;

    return (
        <div>
            <Navbar />
            <div className='max-w-2xl mx-auto my-10'>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className='flex items-center gap-4 mb-8'>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/companies")}
                            disabled={submitting}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <h1 className='text-2xl font-bold'>Company Setup</h1>
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <Label>Company Name *</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <Label>Website</Label>
                            <Input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <Label>Location</Label>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <Label>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {submitting ? 'Updating...' : 'Update Company'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CompanySetup;