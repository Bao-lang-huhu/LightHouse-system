import FrontDeskLayout from "../layouts/FrontDesk_Layout";
import HomeFrontDesk from "../frontdesk_components/HomeFrontDesk";
import ProtectedRoute from "../auth/protectedRoute";
const FHome = () => {
    return (
        <ProtectedRoute allowedRoles={['frontDesk']}>
        <FrontDeskLayout>
            <HomeFrontDesk />
            
        </FrontDeskLayout></ProtectedRoute>
      )
}
export default FHome;