import { setSingleCompany, setError, setLoading } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSingleCompany = async () => {
            if (!companyId) return;

            try {
                dispatch(setLoading(true));
                const { data } = await axios.get(`${COMPANY_API_END_POINT}/${companyId}`, {
                    withCredentials: true
                });
                
                if (data.success) {
                    dispatch(setSingleCompany(data.company));
                    dispatch(setError(null));
                }
            } catch (error) {
                dispatch(setError(error.response?.data?.message || 'Failed to fetch company details'));
            } finally {
                dispatch(setLoading(false));
            }
        };
        
        fetchSingleCompany();
    }, [dispatch, companyId]);
};

export default useGetCompanyById;