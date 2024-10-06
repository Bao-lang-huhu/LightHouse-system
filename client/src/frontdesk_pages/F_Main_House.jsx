import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import MaintenanceHousekeeping from "../frontdesk_components/MaintenanceHouseKeeping";
import ProtectedRoute from "../auth/protectedRoute";

const FMainHouse = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <MaintenanceHousekeeping /> 
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FMainHouse;