import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { setAllJobs, setError, setLoading } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { allJobs, loading, error } = useSelector((state) => state.job);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${JOB_API_END_POINT}/get`, {
          withCredentials: true,
        });

        if (data.success) {
          dispatch(setAllJobs(data.jobs || [])); // Ensure array fallback
          dispatch(setError(null));
        }
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
        dispatch(setAllJobs([])); // Reset on error
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!allJobs?.length) { // Only fetch if not already loaded
      fetchAllJobs();
    }
  }, [dispatch]);

  return {
    allJobs: allJobs || [], // Ensure array return
    loading,
    error
  };
};

export default useGetAllJobs;