import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import RoomBooking from "../frontdesk_components/RoomBooking";
import ProtectedRoute from "../auth/protectedRoute";
const FRoomBook = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <RoomBooking/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FRoomBook;