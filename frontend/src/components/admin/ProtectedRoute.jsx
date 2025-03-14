import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [verified, setVerified] = useState(false);
    const { user, loading } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user || !allowedRoles.includes(user.role)) {
                navigate('/login');
            } else {
                setVerified(true);
            }
        }
    }, [user, loading, allowedRoles, navigate]);

    if (loading || !verified) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return verified ? children : null;
};

export default ProtectedRoute;