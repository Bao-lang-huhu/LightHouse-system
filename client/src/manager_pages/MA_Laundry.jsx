import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchLaundry from "../manager_components/ArchLaundry";
const MALaundry = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchLaundry/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MALaundry;