import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const filtered = companies.filter(company => {
                if (!searchCompanyByText) return true;
                return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
            });
            setFilteredCompanies(filtered);
        } catch (error) {
            toast.error('Error filtering companies');
            console.error('Filter error:', error);
        }
    }, [companies, searchCompanyByText]);

    return (
        <div>
            <Table>
                <TableCaption>A list of your recently registered companies</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage
                                        src={company.logo || '/default-company.png'}
                                        onError={(e) => {
                                            e.target.src = '/default-company.png';
                                        }}
                                    />
                                </Avatar>
                            </TableCell>
                            <TableCell>{company.name || 'N/A'}</TableCell>
                            <TableCell>
                                {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right cursor-pointer">
                                <Popover>
                                    <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        <div
                                            onClick={() => navigate(`/admin/companies/${company.id}`)}
                                            className='flex items-center gap-2 w-fit cursor-pointer hover:bg-gray-100 p-2 rounded'
                                        >
                                            <Edit2 className='w-4' />
                                            <span>Edit</span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default CompaniesTable;