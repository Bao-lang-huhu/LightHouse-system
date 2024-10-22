import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchVenues from "../manager_components/ArchVenues";
const MAVenues = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchVenues/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MAVenues;