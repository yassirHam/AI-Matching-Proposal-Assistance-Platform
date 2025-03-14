import { setAllJobs, setError, setLoading } from '@/redux/jobSlice'; // Use @ alias
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';

const useGetAllJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${JOB_API_END_POINT}/get`, {
          withCredentials: true,
        });
        if (data.success) {
          dispatch(setAllJobs(data.jobs));
          dispatch(setError(null));
        }
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAllJobs();
  }, [dispatch]);
};

export default useGetAllJobs;