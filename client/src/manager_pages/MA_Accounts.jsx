import ManagerLayout3 from "../layouts/ManagerLayout3";
import ArchAccounts from "../manager_components/ArchAccounts";
import ProtectedRoute from "../auth/protectedRoute";

const MAAccounts = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchAccounts/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MAAccounts;