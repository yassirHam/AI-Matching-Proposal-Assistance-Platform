import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { format } from 'date-fns';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const { id } = useParams();
    const dispatch = useDispatch();
    const [isApplied, setIsApplied] = useState(false);

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/application/${id}`,
                null,
                { withCredentials: true }
            );

            if (res.data.success) {
                setIsApplied(true);
                dispatch(setSingleJob({
                    ...singleJob,
                    applications: [...singleJob.applications, res.data.application]
                }));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Application failed');
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const { data } = await axios.get(
                    `${JOB_API_END_POINT}/get/${id}`,
                    { withCredentials: true }
                );
                if (data.success) {
                    dispatch(setSingleJob(data.job));
                    setIsApplied(data.job.applications?.some(
                        app => app.applicant_id === user?.id
                    ));
                }
            } catch (error) {
                toast.error('Failed to load job details');
            }
        };
        fetchSingleJob();
    }, [id, dispatch, user?.id]);

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
                <div className='flex-1'>
                    <h1 className='font-bold text-2xl'>{singleJob?.job_title}</h1>
                    <div className='flex flex-wrap gap-2 mt-4'>
                        <Badge variant="outline" className="text-blue-600">
                            {singleJob?.city}
                        </Badge>
                        <Badge variant="outline" className="text-[#7209b7]">
                            {singleJob?.source}
                        </Badge>
                    </div>
                </div>
                <Button
                    onClick={applyJobHandler}
                    disabled={isApplied}
                    className={`md:w-auto w-full ${isApplied ? 'bg-gray-500' : 'bg-[#7209b7]'}`}
                >
                    {isApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
            </div>

            <div className='mt-8 space-y-6'>
                <div className='space-y-2'>
                    <h2 className='text-xl font-semibold border-b pb-2'>Job Details</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <DetailItem label="Position" value={singleJob?.job_title} />
                        <DetailItem label="Location" value={singleJob?.city} />
                        <DetailItem
                            label="Posted On"
                            value={format(new Date(singleJob?.created_at), 'MMM dd, yyyy')}
                        />
                        <DetailItem label="Applicants" value={singleJob?.applications?.length} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className='flex items-center'>
        <span className='font-medium w-32'>{label}:</span>
        <span className='text-gray-700'>{value}</span>
    </div>
);

export default JobDescription;