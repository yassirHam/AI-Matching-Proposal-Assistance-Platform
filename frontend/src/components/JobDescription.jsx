import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
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
    const isInitiallyApplied = singleJob?.applications?.some(application => application.applicant_id === user?.id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { 
                    ...singleJob, 
                    applications: [...singleJob.applications, { applicant_id: user?.id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Application failed');
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications?.some(application => application.applicant_id === user?.id));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?.id]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.job_title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className='text-blue-700 font-bold' variant="ghost">
                            {singleJob?.city}
                        </Badge>
                        <Badge className='text-[#7209b7] font-bold' variant="ghost">
                            {singleJob?.source}
                        </Badge>
                    </div>
                </div>
                <Button
                    onClick={isApplied ? null : applyJobHandler}
                    disabled={isApplied}
                    className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}
                >
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>
            
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Details</h1>
            <div className='my-4 space-y-2'>
                <div className='flex items-center'>
                    <h1 className='font-bold min-w-[120px]'>Position:</h1>
                    <span className='ml-4 text-gray-800'>{singleJob?.job_title}</span>
                </div>
                <div className='flex items-center'>
                    <h1 className='font-bold min-w-[120px]'>Location:</h1>
                    <span className='ml-4 text-gray-800'>{singleJob?.city}</span>
                </div>
                <div className='flex items-center'>
                    <h1 className='font-bold min-w-[120px]'>Posted On:</h1>
                    <span className='ml-4 text-gray-800'>
                        {format(new Date(singleJob?.created_at), 'MMM dd, yyyy')}
                    </span>
                </div>
                <div className='flex items-center'>
                    <h1 className='font-bold min-w-[120px]'>Source:</h1>
                    <span className='ml-4 text-gray-800'>{singleJob?.source}</span>
                </div>
                <div className='flex items-center'>
                    <h1 className='font-bold min-w-[120px]'>Applicants:</h1>
                    <span className='ml-4 text-gray-800'>{singleJob?.applications?.length || 0}</span>
                </div>
            </div>

            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <p className='text-gray-800'>{singleJob?.description}</p>
            </div>
        </div>
    )
}

export default JobDescription;