import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { setCurrentPage } from '@/redux/jobSlice';

const Jobs = () => {
  const dispatch = useDispatch();
  const { filters, pagination } = useSelector((state) => state.job);
  const { allJobs, loading, error } = useGetAllJobs();

  const handlePageChange = (newPage) => {
    const validatedPage = Math.max(1, Math.min(newPage, pagination.totalPages));
    dispatch(setCurrentPage(validatedPage));
  };

  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [dispatch, filters]);

  if (loading) return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl">Loading jobs...</h1>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl text-red-500">Error: {error}</h1>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-64">
            <FilterCard />
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">
                Showing {allJobs.length} of {pagination.totalJobs} jobs
              </h1>
              {(filters.city || filters.source) && (
                <div className="mt-2 text-sm text-gray-600">
                  {filters.city && <span className="mr-3">City: {filters.city}</span>}
                  {filters.source && <span>Source: {filters.source}</span>}
                </div>
              )}
            </div>

            {allJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No jobs found matching your criteria
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allJobs.map((job) => (
                    <Job key={job.id} job={job} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;