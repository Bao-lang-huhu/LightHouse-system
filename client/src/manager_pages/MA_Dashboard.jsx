import ManagerLayout3 from "../layouts/ManagerLayout3";
import ArchDashboard from "../manager_components/ArchDashboard";
import ProtectedRoute from "../auth/protectedRoute";

const MADashboard = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchDashboard/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MADashboard;