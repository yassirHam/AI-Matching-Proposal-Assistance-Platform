import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Calculate days since posting
    const postDate = new Date(job.created_at);
    const daysAgo = Math.floor((Date.now() - postDate) / (86400000));
    const timePosted = daysAgo === 0 ? "Today" :
                     daysAgo === 1 ? "1 day ago" :
                     `${daysAgo} days ago`;

    // Handle description truncation
    const MAX_DESCRIPTION_LENGTH = 120;
    const shouldTruncate = job.description?.length > MAX_DESCRIPTION_LENGTH;
    const descriptionPreview = shouldTruncate
        ? `${job.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
        : job.description;

    // Toggle save job status
    const handleSaveJob = (e) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
    };

    // Navigate to job details
    const handleViewDetails = () => {
        navigate(`/description/${job.id}`);
    };

    // Navigate to company profile
    const handleViewCompany = () => {
        navigate(`/company/${job.company_id}`);
    };

    return (
        <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            {/* Job Metadata */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {timePosted}
                </p>
                <Button
                    variant="outline"
                    className={`rounded-full ${isSaved ? 'bg-blue-50' : ''}`}
                    size="icon"
                    aria-label={isSaved ? "Unsave job" : "Save job"}
                    onClick={handleSaveJob}
                >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
                </Button>
            </div>

            {/* Company Info */}
            <div className="flex items-center gap-2 my-2">
                <Button
                    className="p-6 hover:bg-gray-50 transition-colors"
                    variant="outline"
                    size="icon"
                    onClick={handleViewCompany}
                >
                    <Avatar>
                        <AvatarImage
                            src={job.company?.logo}
                            alt={`${job.company_name} logo`}
                            className="object-contain"
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                            {job.company_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
                <div>
                    <h1 className="font-medium text-lg">{job.company_name}</h1>
                    <p className="text-sm text-gray-500">{job.city}</p>
                </div>
            </div>

            {/* Job Title */}
            <h1 className="font-bold text-lg my-2">{job.job_title}</h1>

            {/* Job Description */}
            {job.description && (
                <div className="mt-2 text-sm text-gray-600">
                    {isExpanded ? job.description : descriptionPreview}
                </div>
            )}

            {/* Read More Button */}
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-blue-600 text-sm hover:underline focus:outline-none transition-colors"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} job description`}
                >
                    {isExpanded ? 'Show Less' : 'Read More'}
                </button>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-4">
                <Button
                    onClick={handleViewDetails}
                    variant="outline"
                    className="hover:bg-gray-50 transition-colors"
                >
                    View Details
                </Button>
                <Button
                    className="bg-[#7209b7] hover:bg-[#5e0d9b] transition-colors"
                    onClick={handleSaveJob}
                >
                    {isSaved ? 'Saved' : 'Save For Later'}
                </Button>
            </div>
        </div>
    );
};

Job.propTypes = {
    job: PropTypes.shape({
        id: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
        company_name: PropTypes.string,
        city: PropTypes.string,
        job_title: PropTypes.string.isRequired,
        description: PropTypes.string,
        company_id: PropTypes.string,
        company: PropTypes.shape({
            logo: PropTypes.string
        })
    }).isRequired
};

export default Job;