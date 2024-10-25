import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import ProtectedRoute from "../auth/protectedRoute";
import AddHousekeeping from "../frontdesk_components/AddHousekeeping";
const FHousekeeping = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <AddHousekeeping/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FHousekeeping;