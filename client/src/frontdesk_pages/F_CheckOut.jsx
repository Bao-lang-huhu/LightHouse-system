import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import CheckOutTable from "../frontdesk_components/CheckOut";
import ProtectedRoute from "../auth/protectedRoute";
const FCheckOutTable = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
            <FrontDeskLayout>
                <CheckOutTable/>
            </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FCheckOutTable;