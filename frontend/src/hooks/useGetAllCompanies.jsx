import { setCompanies, setError, setLoading } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllCompanies = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                dispatch(setLoading(true));
                const { data } = await axios.get(`${COMPANY_API_END_POINT}`, {
                    withCredentials: true
                });

                if (data.success) {
                    dispatch(setCompanies(data.companies));
                    dispatch(setError(null));
                }
            } catch (error) {
                dispatch(setError(error.response?.data?.message || 'Failed to fetch companies'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchCompanies();
    }, [dispatch]);
};

export default useGetAllCompanies;