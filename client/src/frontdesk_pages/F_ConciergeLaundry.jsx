import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import ConciergeLaundry from "../frontdesk_components/ConciergeLaundry";
import ProtectedRoute from "../auth/protectedRoute";
const FConciergeLaundry = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <ConciergeLaundry/>
            
        </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FConciergeLaundry;