import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import ProtectedRoute from "../auth/protectedRoute";
import AddMaintenance from "../frontdesk_components/AddMaintenance";
const FMaintenance = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <AddMaintenance/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FMaintenance;