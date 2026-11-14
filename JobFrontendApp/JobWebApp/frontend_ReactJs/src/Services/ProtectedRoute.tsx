import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const token = useSelector((state: any) => state.jwt);
    const type = localStorage.getItem("accountType")||""
    const location = useLocation();
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    if (allowedRoles && !allowedRoles.includes(type)) return <Navigate to="/unauthorized" />;

    return children;
}
export default ProtectedRoute;