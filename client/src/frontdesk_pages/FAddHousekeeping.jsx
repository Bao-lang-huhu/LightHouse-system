import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import AddHousekeeping from "../frontdesk_components/AddHousekeeping";
import ProtectedRoute from "../auth/protectedRoute";

const FAddHousekeeping = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
            <FrontDeskLayout>
                <AddHousekeeping/>
            </FrontDeskLayout>
        </ProtectedRoute>
    );
}

export default FAddHousekeeping;
