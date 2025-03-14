import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';

const Browse = () => {
    const { allJobs, isLoading, error } = useGetAllJobs();
    const dispatch = useDispatch();

    useEffect(() => {
        return () => dispatch(setSearchedQuery(""));
    }, [dispatch]);

    if (isLoading) return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10">Loading jobs...</h1>
            </div>
        </div>
    );

    if (error) return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10 text-red-500">
                    Error: {error.message || "Failed to fetch jobs"}
                </h1>
            </div>
        </div>
    );

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10">
                    Search Results ({allJobs.length})
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allJobs.map(job => (
                        <Job key={job.id} job={job} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Browse;