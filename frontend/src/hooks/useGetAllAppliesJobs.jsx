import { setAllAppliedJobs, setError, setLoading } from '@/redux/jobSlice'; // Use @ alias
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';

const useGetAllAppliesJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
          withCredentials: true,
        });
        if (data.success) {
          dispatch(setAllAppliedJobs(data.applications));
          dispatch(setError(null));
        }
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch applications'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAppliedJobs();
  }, [dispatch]);
};

export default useGetAllAppliesJobs;