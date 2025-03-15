import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import Navbar from './shared/Navbar';

const Dashboard = () => {
    const { user, loading } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return <Loader />;

    return (
        <div>
            <Navbar />
            <div className="p-4 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Welcome, {user?.fullname}</h1>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">Your Profile</h2>
                        <p className="text-gray-600 mt-2">View and update your profile information.</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">Applications</h2>
                        <p className="text-gray-600 mt-2">Track your job applications.</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">Settings</h2>
                        <p className="text-gray-600 mt-2">Manage your account settings.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;