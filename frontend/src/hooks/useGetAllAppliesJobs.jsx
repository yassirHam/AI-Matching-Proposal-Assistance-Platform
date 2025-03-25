import { setAllAppliedJobs, setError, setLoading } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useNavigate } from 'react-router-dom';


const useGetAllAppliesJobs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                dispatch(setLoading(true));

                const { data } = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (data.success) {
                    dispatch(setAllAppliedJobs(data.applications));
                }
            } catch (error) {
                console.error('Fetch applications error:', error);

                if (error.response?.status === 401) {
                    // Redirect to login if unauthorized
                    navigate('/login');
                    dispatch(setError('Session expired. Please login again.'));
                } else {
                    dispatch(setError(
                        error.response?.data?.message ||
                        'Failed to fetch applications'
                    ));
                }
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (token) {
            fetchAppliedJobs();
        }
    }, [dispatch, token, navigate]);
};

export default useGetAllAppliesJobs;