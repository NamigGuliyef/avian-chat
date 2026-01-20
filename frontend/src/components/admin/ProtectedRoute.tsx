import { useSession } from "@/lib/auth";
import { Roles } from "@/types/types";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
    allowedRoles: Roles[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const { session } = useSession();
    console.log('session', session)

    if (!session?.token) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(session?.user?.role as Roles)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
