import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Loader from './Loader';

const Browse = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.job);
  const {
    allJobs,
    loading,
    error,
    pagination,
    setCurrentPage,
    setLimit
  } = useGetAllJobs();

  const [pageInput, setPageInput] = useState(pagination.currentPage);

  // Sync input with current page
  useEffect(() => {
    setPageInput(pagination.currentPage);
  }, [pagination.currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    dispatch(setCurrentPage(1));
    dispatch(setSearchedQuery(''));
  }, [dispatch, filters]);

  const handlePageChange = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      dispatch(setCurrentPage(page));
    } else {
      setPageInput(pagination.currentPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    dispatch(setLimit(newLimit));
    dispatch(setCurrentPage(1));
  };

  const handlePageNavigation = (direction) => {
    const newPage = direction === 'prev'
      ? pagination.currentPage - 1
      : pagination.currentPage + 1;
    dispatch(setCurrentPage(newPage));
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <Loader />
        <h1 className="font-bold text-xl my-10 text-center">Loading jobs...</h1>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 p-4 bg-red-50 rounded-lg">
        <h1 className="font-bold text-xl text-red-500">
          Error: {error || "Failed to fetch jobs"}
        </h1>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {pagination.totalJobs} {pagination.totalJobs === 1 ? 'Job' : 'Jobs'} Available
          </h1>
          <p className="text-gray-600 mt-2">
            Showing {allJobs.length} jobs on page {pagination.currentPage} of {pagination.totalPages}
          </p>
        </div>

        {/* Results per page selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Results per page:</span>
            <select
              value={pagination.limit}
              onChange={handleLimitChange}
              className="border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {[10, 20, 30, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {allJobs.length > 0 ? (
            allJobs.map(job => (
              <Job key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-gray-500 text-lg mb-4">
                No jobs found matching your criteria
              </div>
              <button
                onClick={() => dispatch(setCurrentPage(1))}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col items-center mt-8 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageNavigation('prev')}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-white border rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <form onSubmit={handlePageChange} className="flex">
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pageInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (Number(value) > 0 && Number(value) <= pagination.totalPages)) {
                      setPageInput(value);
                    }
                  }}
                  className="w-16 px-3 py-2 border-t border-b text-center focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-r hover:bg-blue-600"
                >
                  Go
                </button>
              </form>

              <button
                onClick={() => handlePageNavigation('next')}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-white border rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;