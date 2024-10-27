import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import ProtectedRoute from "../auth/protectedRoute";
import AddConcierge from "../frontdesk_components/AddConcierge";
const FConcierge = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <AddConcierge/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FConcierge;