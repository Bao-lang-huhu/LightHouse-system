import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import RoomWalkIn from "../frontdesk_components/RoomWalkIn";
import ProtectedRoute from "../auth/protectedRoute";
const FRoomWalkIn = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <RoomWalkIn/>
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FRoomWalkIn;