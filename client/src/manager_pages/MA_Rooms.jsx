import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchRooms from "../manager_components/ArchRooms";
const MARooms = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchRooms/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MARooms;