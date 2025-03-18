import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20); // Jobs per page
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // Pagination calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filterJobs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filterJobs.length / itemsPerPage);

    // Read More toggle
    const toggleDescription = (jobId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };

    // Filter jobs based on search query
    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                const searchLower = searchedQuery.toLowerCase();
                return (
                    job.job_title?.toLowerCase().includes(searchLower) ||
                    job.description?.toLowerCase().includes(searchLower) ||
                    job.city?.toLowerCase().includes(searchLower)
                );
            });
            setFilterJobs(filteredJobs);
            setCurrentPage(1); // Reset to first page on new search
        } else {
            setFilterJobs(allJobs);
        }
    }, [allJobs, searchedQuery]);

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto mt-5">
                <div className="flex gap-5">
                    {/* Filter Section */}
                    <div className="w-20%">
                        <FilterCard />
                    </div>

                    {/* Jobs Section */}
                    {filterJobs.length <= 0 ? (
                        <div className="flex-1 flex items-center justify-center h-[88vh]">
                            <span className="text-gray-500 text-lg">No jobs found matching your criteria</span>
                        </div>
                    ) : (
                        <div className="flex-1 h-[88vh] overflow-y-auto pb-5">
                            {/* Job Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentJobs.map((job) => (
                                    <div key={job.id} className="bg-white rounded-lg shadow-md p-4">
                                        <Job job={job} />

                                        {/* Description with Read More */}
                                        {job.description && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                {expandedDescriptions[job.id]
                                                    ? job.description
                                                    : `${job.description.substring(0, 120)}${job.description.length > 120 ? '...' : ''}`
                                                }
                                            </div>
                                        )}

                                        {/* Read More Button */}
                                        {job.description?.length > 120 && (
                                            <button
                                                onClick={() => toggleDescription(job.id)}
                                                className="mt-2 text-blue-600 text-sm hover:underline"
                                            >
                                                {expandedDescriptions[job.id] ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6 gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-200 rounded-l disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 bg-gray-100">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-200 rounded-r disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jobs;