import { setAllAdminJobs, setError, setLoading } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                dispatch(setLoading(true));
                const { data } = await axios.get(`${JOB_API_END_POINT}/job/admin`, {
                    withCredentials: true
                });

                if (data.success) {
                    dispatch(setAllAdminJobs(data.data));
                    dispatch(setError(null));
                }
            } catch (error) {
                dispatch(setError(error.response?.data?.message || 'Failed to fetch admin jobs'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchAllAdminJobs();
    }, [dispatch]);
};

export default useGetAllAdminJobs;