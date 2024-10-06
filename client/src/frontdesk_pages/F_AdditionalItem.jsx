import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import AdditionalItem from "../frontdesk_components/AdditionalItem";
import ProtectedRoute from "../auth/protectedRoute";
const FAdditionalItem = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <AdditionalItem/>
            
        </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FAdditionalItem;