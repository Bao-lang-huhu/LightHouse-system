import ProtectedRoute from "../auth/protectedRoute";
import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import RoomReservation from "../frontdesk_components/Room_Reservations";
const FRoomReservation = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <RoomReservation />
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FRoomReservation;