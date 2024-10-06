import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import CheckInTable from "../frontdesk_components/CheckIn";
import ProtectedRoute from "../auth/protectedRoute";
const FCheckInTable = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
            <FrontDeskLayout>
                <CheckInTable/>
            </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FCheckInTable;