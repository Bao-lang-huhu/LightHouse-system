import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import EventWalkIn from "../frontdesk_components/EventWalkIn";
import ProtectedRoute from "../auth/protectedRoute";
const FEventWalkIn = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <EventWalkIn/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FEventWalkIn;