import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const DetailItem = ({ label, value }) => (
    <div className='flex items-center'>
        <span className='font-medium w-32'>{label}:</span>
        <span className='text-gray-700'>{value || 'Not specified'}</span>
    </div>
);

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isApplied, setIsApplied] = useState(false);
    const [loading, setLoading] = useState(true);

    const isExternalJob = Boolean(singleJob?.job_link);

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${JOB_API_END_POINT}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });

                if (data.success) {
                    dispatch(setSingleJob(data.job));
                    setIsApplied(data.job.applications?.some(app => app.applicant_id === user?.id));
                }
            } catch (error) {
                toast.error('Failed to load job details');
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchSingleJob();
    }, [id, dispatch, user?.id, navigate]);

    const handleExternalApply = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Crucial to prevent any parent navigation

        try {
            if (!singleJob?.job_link) {
                throw new Error('No application link available');
            }

            // Save current location
            const currentLocation = window.location.href;

            // Attempt to open in new tab
            const newWindow = window.open(singleJob.job_link, '_blank', 'noopener,noreferrer');

            // If popup blocked, try again but don't navigate current window
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                window.open(singleJob.job_link, '_blank', 'noopener,noreferrer');
            }

            setIsApplied(true);
            toast.success('Opening company application page...');

            // Reset location in case any parent handler tried to navigate
            setTimeout(() => {
                if (window.location.href !== currentLocation) {
                    window.location.href = currentLocation;
                }
            }, 100);

        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleInternalApply = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/application/${id}`,
                null,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } }
            );

            if (res.data.success) {
                setIsApplied(true);
                dispatch(setSingleJob({
                    ...singleJob,
                    applications: [...(singleJob.applications || []), res.data.application]
                }));
                toast.success('Application submitted!');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Application failed');
            }
        }
    };

    if (loading) return <div className="text-center py-8">Loading job details...</div>;
    if (!singleJob) return <div className="text-center py-8">Job not found</div>;

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <Button asChild variant="ghost" className="mb-4 hover:bg-gray-100">
                <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
            </Button>

            <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
                <div className='flex-1'>
                    <h1 className='font-bold text-2xl'>{singleJob?.job_title || 'No title available'}</h1>
                    <div className='flex flex-wrap gap-2 mt-4'>
                        <Badge variant="outline" className="text-blue-600">
                            {singleJob?.city || 'Location not specified'}
                        </Badge>
                        {isExternalJob && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <ExternalLink size={14} />
                                External Application
                            </Badge>
                        )}
                    </div>
                </div>

                {isExternalJob ? (
                    <Button
                        onClick={handleExternalApply}
                        disabled={isApplied}
                        className={`md:w-auto w-full gap-2 ${isApplied ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isApplied ? (
                            'Applied ✓'
                        ) : (
                            <>
                                <ExternalLink size={16} />
                                Apply on Company Site
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleInternalApply}
                        disabled={isApplied}
                        className={`md:w-auto w-full ${isApplied ? 'bg-gray-500' : 'bg-[#7209b7]'}`}
                    >
                        {isApplied ? 'Applied ✓' : 'Apply Now'}
                    </Button>
                )}
            </div>

            <div className='mt-8 space-y-6'>
                <div className='space-y-2'>
                    <h2 className='text-xl font-semibold border-b pb-2'>Job Details</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <DetailItem label="Position" value={singleJob?.job_title} />
                        <DetailItem label="Location" value={singleJob?.city} />
                        <DetailItem
                           label="Posted On"
                           value={singleJob?.created_at ?
                           format(new Date(singleJob.created_at), 'MMM dd, yyyy') :
                           'Date not available'
                          }
                        />
                        {!isExternalJob && (
                            <DetailItem label="Applicants" value={singleJob?.applications?.length || 0} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;