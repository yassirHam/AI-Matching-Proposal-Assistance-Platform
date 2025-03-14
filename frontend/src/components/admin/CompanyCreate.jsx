import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const validateInput = () => {
        if (!companyName.trim()) {
            toast.error("Company name is required");
            return false;
        }
        if (companyName.length > 100) {
            toast.error("Company name must be less than 100 characters");
            return false;
        }
        return true;
    };

    const registerNewCompany = async () => {
        if (!validateInput()) return;

        setLoading(true);
        try {
            const response = await axios.post(
                COMPANY_API_END_POINT,
                {
                    name: companyName,
                    description: "Default description",
                    website: "",
                    location: ""
                },
                {
                    withCredentials: true,
                    validateStatus: (status) => status < 500
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Company creation failed');
            }

            dispatch({
                type: 'company/addCompany',
                payload: response.data.company
            });

            toast.success("Company created successfully");
            navigate(`/admin/companies/${response.data.company.id}`);
        } catch (error) {
            console.error('Creation error:', error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto'>
                <div className='my-10'>
                    <h1 className='font-bold text-2xl'>Create New Company</h1>
                    <p className='text-gray-500'>Provide basic company information</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Company Name *</Label>
                        <Input
                            type="text"
                            className="my-2"
                            placeholder="Enter company name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className='flex items-center gap-2 my-10'>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/companies")}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={registerNewCompany}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Company'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyCreate;