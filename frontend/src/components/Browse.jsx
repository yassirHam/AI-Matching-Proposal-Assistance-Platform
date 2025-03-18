import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Loader from './Loader';

const Browse = () => {
  const dispatch = useDispatch();
  const { allJobs, loading, error, currentPage, setCurrentPage } = useGetAllJobs(); // Removed limit

  useEffect(() => {
    return () => dispatch(setSearchedQuery(""));
  }, [dispatch]);

  if (loading) return (
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
          Error: {error || "Failed to fetch jobs"}
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

        {/* Pagination Controls */}
        <div className="flex justify-center mt-10 gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100">
            Page {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 rounded-r"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Browse;