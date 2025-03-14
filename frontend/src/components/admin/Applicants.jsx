import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(
                    `${JOB_API_END_POINT}/${params.id}/applicants`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(setAllApplicants(res.data.applicants));
                }
            } catch (error) {
                console.error("Error fetching applicants:", error.response?.data?.message);
            }
        };
        fetchAllApplicants();
    }, [dispatch, params.id]);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <h1 className='font-bold text-xl my-5'>Applicants ({applicants?.length || 0})</h1>
                <ApplicantsTable />
            </div>
        </div>
    )
}

export default Applicants;