import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar.jsx';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminJobsTable from './AdminJobsTable';
import { setSearchJobByText } from '@/redux/jobSlice';
import axios from 'axios'; // Assuming you're using axios for API calls

const AdminJobs = () => {
  const [input, setInput] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchAdminJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/job/admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminJobs();
  }, []);

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10">
        <div className="flex items-center justify-between my-5">
          <Input
            className="w-fit"
            placeholder="Filter by job title, company"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate('/admin/jobs/create')}>New Job</Button>
        </div>

        {/* Display loading or error messages */}
        {loading && <p>Loading jobs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Pass jobs data to the table */}
        <AdminJobsTable jobs={jobs} />
      </div>
    </div>
  );
};

export default AdminJobs;