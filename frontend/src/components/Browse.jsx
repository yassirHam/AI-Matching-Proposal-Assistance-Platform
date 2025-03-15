import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Loader from './Loader'; // Keep Loader import

const Browse = () => {
    const dispatch = useDispatch(); // Hooks must be called first
    const { allJobs, loading, error } = useGetAllJobs();

    // Cleanup effect
    useEffect(() => {
        return () => dispatch(setSearchedQuery(""));
    }, [dispatch]);

    // Loading state
    if (loading) return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10">Loading jobs...</h1>
            </div>
        </div>
    );

    // Error state - using inline error display
    if (error) return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10 text-red-500">
                    Error: {error || "Failed to fetch jobs"}
                </h1>
            </div>
        </div>
    );

    // Main return
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