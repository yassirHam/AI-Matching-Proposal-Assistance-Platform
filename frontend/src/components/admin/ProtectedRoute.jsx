import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !allowedRoles.includes(user.role)) {
            navigate("/");
        }
    }, [user, navigate, allowedRoles]);

    return user ? children : null;
};

export default ProtectedRoute;
