    import React from 'react';
    import { Button } from './ui/button';
    import { Bookmark } from 'lucide-react';
    import { Avatar, AvatarImage } from './ui/avatar';
    import { useNavigate } from 'react-router-dom';

    const Job = ({ job }) => {
        const navigate = useNavigate();

        const daysAgoFunction = (postgresTimestamp) => {
            const createdAt = new Date(postgresTimestamp);
            const currentTime = new Date();
            const timeDifference = currentTime - createdAt;
            return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        };

        return (
            <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {daysAgoFunction(job?.created_at) === 0
                            ? "Today"
                            : `${daysAgoFunction(job?.created_at)} days ago`}
                    </p>
                    <Button variant="outline" className="rounded-full" size="icon">
                        <Bookmark />
                    </Button>
                </div>

                <div className="flex items-center gap-2 my-2">
                    <Button className="p-6" variant="outline" size="icon">
                        <Avatar>
                            <AvatarImage src={job?.company_logo} />
                        </Avatar>
                    </Button>
                    <div>
                        <h1 className="font-medium text-lg">{job?.company_name}</h1>
                        <p className="text-sm text-gray-500">{job?.city}</p>
                    </div>
                </div>

                <div>
                    <h1 className="font-bold text-lg my-2">{job?.job_title}</h1>
                    <p className="text-sm text-gray-600">{job?.description}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <Button
                        onClick={() => navigate(`/description/${job?.id}`)}
                        variant="outline"
                    >
                        Details
                    </Button>
                    <Button className="bg-[#7209b7]">Save For Later</Button>
                </div>
            </div>
        );
    };

    export default Job;