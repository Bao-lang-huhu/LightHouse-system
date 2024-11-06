import ProfileLayout from "../layouts/ProfileLayout";
import StaffProfile from "../manager_components/StaffProfile";
import ProtectedRoute from "../auth/protectedRoute";
const MStaffProfile = () => {
    return (
        <ProtectedRoute allowedRoles={['manager', 'restaurantDesk', 'barDesk', 'frontDesk']}>
            <ProfileLayout>
                <StaffProfile/>
            </ProfileLayout>
        </ProtectedRoute>
      )
}
export default MStaffProfile;