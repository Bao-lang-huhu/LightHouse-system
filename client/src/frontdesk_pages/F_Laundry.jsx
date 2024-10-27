import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import ProtectedRoute from "../auth/protectedRoute";
import AddLaundry from "../frontdesk_components/AddLaundry";
const FLaundry = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <AddLaundry/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FLaundry;