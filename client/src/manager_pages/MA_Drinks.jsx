import ManagerLayout3 from "../layouts/ManagerLayout3";
import ProtectedRoute from "../auth/protectedRoute";
import ArchDrinks from "../manager_components/ArchDrinks";
const MADrinks = () => {
    return (
        <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout3>
                <ArchDrinks/>
            </ManagerLayout3>
        </ProtectedRoute>
      )
}
export default MADrinks;