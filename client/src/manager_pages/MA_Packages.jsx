import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchPackages from "../manager_components/ArchPackages";
const MAPackages = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                < ArchPackages/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MAPackages;