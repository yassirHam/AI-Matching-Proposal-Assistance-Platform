import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { setAllJobs, setError, setLoading } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { allJobs, loading, error } = useSelector((state) => state.job);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${JOB_API_END_POINT}/get`, {
          params: { page: currentPage, limit },
          withCredentials: true,
        });

        if (data.success) {
          dispatch(setAllJobs(data.data.jobs || []));
          dispatch(setError(null));
        }
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
        dispatch(setAllJobs([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAllJobs();
  }, [currentPage, limit, dispatch]);

  return {
    allJobs: allJobs || [],
    loading,
    error,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
  };
};

export default useGetAllJobs;