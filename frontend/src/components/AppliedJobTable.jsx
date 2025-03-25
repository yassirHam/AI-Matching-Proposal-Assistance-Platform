import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Button } from './ui/button';

const AppliedJobTable = () => {
    const { allAppliedJobs, loading, error } = useSelector(store => store.job);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(5);

    // Data normalization functions
    const getJobTitle = (job) => job?.job_title || job?.title || 'No title';
    const getCompanyName = (job) => job?.company?.name || job?.company_name || 'No company';
    const getCreatedDate = (date) => date ? format(new Date(date), 'yyyy-MM-dd') : 'N/A';
    const getStatus = (status) => status?.toUpperCase() || 'PENDING';

    // Pagination calculations
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = allAppliedJobs?.slice(indexOfFirstJob, indexOfLastJob) || [];
    const totalPages = Math.ceil((allAppliedJobs?.length || 0) / jobsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="text-center py-4">Loading applications...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

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
                    {currentJobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                                {allAppliedJobs.length === 0
                                    ? "You haven't applied to any jobs yet"
                                    : "No jobs found on this page"}
                            </TableCell>
                        </TableRow>
                    ) : (
                        currentJobs.map((application) => (
                            <TableRow key={application.id || application._id}>
                                <TableCell>{getCreatedDate(application.created_at)}</TableCell>
                                <TableCell>{getJobTitle(application.job)}</TableCell>
                                <TableCell>{getCompanyName(application.job)}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={
                                        application.status === 'accepted' ? 'default' :
                                        application.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {getStatus(application.status)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4">
                    <Button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mr-2"
                        variant="outline"
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
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppliedJobTable;