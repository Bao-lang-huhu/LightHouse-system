import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import DashboardFront from "../frontdesk_components/DashboardFront";
import ProtectedRoute from "../auth/protectedRoute";
const FDashboard = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <DashboardFront/>
        </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FDashboard;