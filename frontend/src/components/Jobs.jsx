import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                return (
                    job.job_title?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.city?.toLowerCase().includes(searchedQuery.toLowerCase())
                );
            });
            setFilterJobs(filteredJobs);
        } else {
            setFilterJobs(allJobs);
        }
    }, [allJobs, searchedQuery]);

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto mt-5">
                <div className="flex gap-5">
                    <div className="w-20%">
                        <FilterCard />
                    </div>
                    {filterJobs.length <= 0 ? (
                        <div className="flex-1 flex items-center justify-center h-[88vh]">
                            <span className="text-gray-500 text-lg">No jobs found matching your criteria</span>
                        </div>
                    ) : (
                        <div className="flex-1 h-[88vh] overflow-y-auto pb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filterJobs.map((job) => (
                                    <div key={job.id}>
                                        <Job job={job} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jobs;