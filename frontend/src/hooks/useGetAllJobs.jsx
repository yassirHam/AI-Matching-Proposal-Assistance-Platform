import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import {
  setAllJobs,
  setLoading,
  setError,
  setPagination,
  setLimit,
  setCurrentPage
} from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { filters, pagination } = useSelector((state) => state.job);

  const fetchJobs = async () => {
    try {
      dispatch(setLoading(true));

      const params = {
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        keyword: filters.keyword || '',
        city: filters.city || '',
        source: filters.source || ''
      };

      const { data } = await axios.get(`${JOB_API_END_POINT}/get`, {
        params,
        withCredentials: true,
      });

      if (data.success) {
        dispatch(setAllJobs(data.data.jobs));
        dispatch(setPagination({
          currentPage: data.data.currentPage,
          totalJobs: data.data.total,
          totalPages: data.data.totalPages,
          limit: data.data.limit
        }));
      }
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pagination.currentPage, pagination.limit, filters]);

  return {
    allJobs: useSelector((state) => state.job.allJobs),
    loading: useSelector((state) => state.job.loading),
    error: useSelector((state) => state.job.error),
    pagination: useSelector((state) => state.job.pagination),
    setCurrentPage: (page) => dispatch(setCurrentPage(page)),
    setLimit: (limit) => dispatch(setLimit(limit))
  };
};
export default useGetAllJobs;