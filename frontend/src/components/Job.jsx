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

    // Safely calculate days since posting
    const getTimePosted = () => {
        if (!job?.created_at) return "Recently";

        try {
            const postDate = new Date(job.created_at);
            if (isNaN(postDate.getTime())) return "Recently";

            const daysAgo = Math.floor((Date.now() - postDate) / 86400000);
            return daysAgo === 0 ? "Today" :
                   daysAgo === 1 ? "1 day ago" :
                   `${daysAgo} days ago`;
        } catch {
            return "Recently";
        }
    };

    const timePosted = getTimePosted();

    // Safe description handling
    const MAX_DESCRIPTION_LENGTH = 120;
    const description = job?.description || '';
    const shouldTruncate = description.length > MAX_DESCRIPTION_LENGTH;
    const descriptionPreview = shouldTruncate
        ? `${description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
        : description;

    // Toggle save job status
    const handleSaveJob = (e) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
    };

    // Safe navigation functions
    const handleViewDetails = () => {
        if (job?.id) {
            navigate(`/jobs/${job.id}`);
        }
    };

    const handleViewCompany = (e) => {
        e.stopPropagation();
        if (job?.company_id) {
            navigate(`/company/${job.company_id}`);
        }
    };

    return (
        <div
            className="p-5 rounded-md shadow-xl bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            onClick={handleViewDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleViewDetails()}
        >
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
                    aria-label={`View ${job.company_name || 'company'} profile`}
                >
                    <Avatar>
                        <AvatarImage
                            src={job.company?.logo}
                            alt={`${job.company_name || 'Company'} logo`}
                            className="object-contain"
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                            {(job.company_name || 'C').charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
                <div>
                    <h1 className="font-medium text-lg">{job.company_name || 'Unknown Company'}</h1>
                    <p className="text-sm text-gray-500">{job.city || 'Location not specified'}</p>
                </div>
            </div>

            {/* Job Title */}
            <h1 className="font-bold text-lg my-2">{job.job_title || 'Untitled Position'}</h1>

            {/* Job Description */}
            {description && (
                <div className="mt-2 text-sm text-gray-600">
                    {isExpanded ? description : descriptionPreview}
                </div>
            )}

            {/* Read More Button */}
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
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
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails();
                    }}
                    variant="outline"
                    className="hover:bg-gray-50 transition-colors"
                >
                    View Details
                </Button>
                <Button
                    className="bg-[#7209b7] hover:bg-[#5e0d9b] transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSaveJob(e);
                    }}
                >
                    {isSaved ? 'Saved' : 'Save For Later'}
                </Button>
            </div>
        </div>
    );
};

Job.propTypes = {
    job: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        company_name: PropTypes.string,
        city: PropTypes.string,
        job_title: PropTypes.string,
        description: PropTypes.string,
        company_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        company: PropTypes.shape({
            logo: PropTypes.string
        })
    }).isRequired
};

export default Job;