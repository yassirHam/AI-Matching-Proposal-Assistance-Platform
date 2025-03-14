import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [formData, setFormData] = useState({
        job_title: '',
        city: '',
        job_link: '',
        source: '',
        company_id: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const { companies } = useSelector(store => store.company);
    const navigate = useNavigate();

    const validateForm = () => {
        const requiredFields = ['job_title', 'city', 'job_link', 'company_id'];
        const missingFields = requiredFields.filter(field => !formData[field].trim());

        if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (!isValidUrl(formData.job_link)) {
            toast.error('Please enter a valid URL for the job link');
            return false;
        }

        return true;
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await axios.post(
                JOB_API_END_POINT,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success('Job posted successfully');
            navigate('/admin/jobs');
        } catch (error) {
            console.error('Posting error:', error);
            toast.error(error.response?.data?.message || 'Job posting failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Post New Job</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Job Title *</Label>
                        <Input
                            name="job_title"
                            value={formData.job_title}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Job Link *</Label>
                        <Input
                            name="job_link"
                            value={formData.job_link}
                            onChange={(e) => setFormData({ ...formData, job_link: e.target.value })}
                            disabled={submitting}
                            placeholder="https://example.com/job"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Source</Label>
                        <Input
                            name="source"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Company *</Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                            disabled={submitting || companies.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {companies.map(company => (
                                        <SelectItem key={company.id} value={company.id.toString()}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {companies.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                No companies available. Please create a company first.
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={submitting || companies.length === 0}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {submitting ? 'Posting...' : 'Post Job'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default PostJob;