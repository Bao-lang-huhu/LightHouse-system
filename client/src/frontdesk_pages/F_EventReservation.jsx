import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import EventReservation from "../frontdesk_components/Event_Reservations";
import ProtectedRoute from "../auth/protectedRoute";


const FEventReservation = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
            <FrontDeskLayout>
                <EventReservation />
                
            </FrontDeskLayout>
        </ProtectedRoute>
      )
}
export default FEventReservation;