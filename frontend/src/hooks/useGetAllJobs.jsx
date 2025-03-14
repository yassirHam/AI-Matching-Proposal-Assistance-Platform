import { setAllJobs, setError, setLoading } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                dispatch(setLoading(true));
                const { data } = await axios.get(`${JOB_API_END_POINT}`, {
                    params: { search: searchedQuery },
                    withCredentials: true
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
    }, [dispatch, searchedQuery]);
};

export default useGetAllJobs;