import ManagerLayout from "../layouts/Manager_Layout";
import StaffProfile from "../manager_components/StaffProfile";
import ProtectedRoute from "../auth/protectedRoute";
const MStaffProfile = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout>
                <StaffProfile/>
            </ManagerLayout>
        </ProtectedRoute>
      )
}
export default MStaffProfile;