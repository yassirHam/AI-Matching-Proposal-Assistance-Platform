import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const statusOptions = ["pending", "accepted", "rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);

    const handleStatusUpdate = async (status, id) => {
        try {
            const res = await axios.patch(
                `${APPLICATION_API_END_POINT}/${id}/status`,
                { status },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
            return false;
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of applicants</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants?.map((applicant) => (
                        <TableRow key={applicant.id}>
                            <TableCell>{applicant.fullname}</TableCell>
                            <TableCell>{applicant.email}</TableCell>
                            <TableCell>{applicant.phone_number || 'N/A'}</TableCell>
                            <TableCell>
                                {applicant.resume ? (
                                    <a className="text-blue-600 hover:underline"
                                       href={applicant.resume}
                                       target="_blank"
                                       rel="noopener noreferrer">
                                        {applicant.resume_original_name}
                                    </a>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell className={`font-medium ${
                                applicant.status === 'accepted' ? 'text-green-500' :
                                applicant.status === 'rejected' ? 'text-red-500' : ''
                            }`}>
                                {applicant.status}
                            </TableCell>
                            <TableCell>{new Date(applicant.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right cursor-pointer">
                                <Popover>
                                    <PopoverTrigger>
                                        <MoreHorizontal />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        {statusOptions.map((status) => (
                                            <div
                                                key={status}
                                                onClick={() => handleStatusUpdate(status, applicant.id)}
                                                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                                    status === 'accepted' ? 'text-green-500' :
                                                    status === 'rejected' ? 'text-red-500' : ''
                                                }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </div>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable;