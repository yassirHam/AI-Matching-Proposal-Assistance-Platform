import React from 'react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/description/${job.id}`)}
            className='p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer'
        >
            <div className='mb-3'>
                <h1 className='font-bold text-lg'>{job.job_title}</h1>
                <p className='text-sm text-gray-500 mt-1'>
                    {job.city} • {new Date(job.created_at).toLocaleDateString()}
                </p>
            </div>

            <div className='flex items-center gap-2'>
                <Badge className="text-blue-700 font-bold" variant="ghost">
                    {job.source}
                </Badge>
                <Badge className="text-[#7209b7] font-bold" variant="ghost">
                    {job.job_link ? 'Link Available' : 'No Link'}
                </Badge>
            </div>
        </div>
    );
};

export default LatestJobCards;