import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["accepted", "rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.patch(`${APPLICATION_API_END_POINT}/application/${id}/status`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
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
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants?.map((applicant) => (
                            <TableRow key={applicant.id}>
                                <TableCell>{applicant?.fullname}</TableCell>
                                <TableCell>{applicant?.email}</TableCell>
                                <TableCell>{applicant?.phone_number}</TableCell>
                                <TableCell>
                                    {
                                        applicant?.resume ? <a className="text-blue-600 cursor-pointer" href={applicant.resume} target="_blank" rel="noopener noreferrer">{applicant.resume_original_name}</a> : <span>NA</span>
                                    }
                                </TableCell>
                                <TableCell>{applicant?.created_at?.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            {
                                                shortlistingStatus.map((status, index) => (
                                                    <div onClick={() => statusHandler(status, applicant?.id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
                                                        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                                    </div>
                                                ))
                                            }
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable