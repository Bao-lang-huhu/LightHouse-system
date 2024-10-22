import ManagerLayout3 from "../layouts/ManagerLayout3";
import ArchConcierge from "../manager_components/ArchConcierge";
import ProtectedRoute from "../auth/protectedRoute";

const MAConcierges = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchConcierge/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MAConcierges;