import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchFoods from "../manager_components/ArchFoods";
const MAFoods = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchFoods/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MAFoods;