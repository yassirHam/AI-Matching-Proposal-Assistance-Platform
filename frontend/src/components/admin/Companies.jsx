import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import CompaniesTable from './CompaniesTable';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSearchCompanyByText } from '@/redux/companySlice';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const Companies = () => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(COMPANY_API_END_POINT, {
                withCredentials: true
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch companies');
            }

            dispatch({ type: 'company/setCompanies', payload: response.data.companies });
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        dispatch(setSearchCompanyByText(input));
    }, [input, dispatch]);

    if (loading) return <div className="text-center p-4">Loading companies...</div>;
    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10'>
                <div className='flex items-center justify-between my-5'>
                    <Input
                        className="w-fit"
                        placeholder="Filter by name"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button
                        onClick={() => navigate("/admin/companies/create")}
                        disabled={loading}
                    >
                        New Company
                    </Button>
                </div>
                <CompaniesTable />
            </div>
        </div>
    );
};

export default Companies;