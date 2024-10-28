import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import AddMaintenance from "../frontdesk_components/AddMaintenance";
import ProtectedRoute from "../auth/protectedRoute";

const FAddMaintenance = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
            <FrontDeskLayout>
                <AddMaintenance/>
            </FrontDeskLayout>
        </ProtectedRoute>
    );
}

export default FAddMaintenance;
