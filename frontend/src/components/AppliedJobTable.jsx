import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { Button } from './ui/button'; // Assuming you have a Button component for pagination controls

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(5);

    const getBadgeColor = (status) => {
        switch (status) {
            case 'rejected':
                return 'bg-red-400';
            case 'pending':
                return 'bg-gray-400';
            case 'accepted':
                return 'bg-green-400';
            default:
                return 'bg-gray-400';
        }
    };

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = allAppliedJobs.slice(indexOfFirstJob, indexOfLastJob);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Total number of pages
    const totalPages = Math.ceil(allAppliedJobs.length / jobsPerPage);

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentJobs.length <= 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                You haven't applied to any jobs yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        currentJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>
                                    {format(new Date(appliedJob?.createdAt), 'yyyy-MM-dd')}
                                </TableCell>
                                <TableCell>{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={getBadgeColor(appliedJob.status)}>
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4">
                <Button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mr-2"
                >
                    Previous
                </Button>
                <span className="mx-2">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-2"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default AppliedJobTable;