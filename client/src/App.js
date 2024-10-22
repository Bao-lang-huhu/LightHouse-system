import {BrowserRouter, Route, Routes} from "react-router-dom";
import GHome from "./pages/G_Home";
import GAbout from "./pages/G_About";
import GContact from "./pages/G_Contact";
import GLogin from "./pages/G_Login";
import GRegister from "./pages/G_Register";
import GFaq from "./pages/G_Faq";
import GTerms from "./pages/G_Terms";
import GCancel from "./pages/G_Cancel";
import GWebsiteData from "./pages/G_WebsiteData";
import GProfile from "./pages/G_Profile";
import GEvent_1 from "./pages/G_Event_1";
import GResturant_1 from "./pages/G_Resturant_1";
import GResturant_2 from "./pages/G_Resturant_2";
import GRoomSearch from "./pages/G_RoomSearch";
import GRoomDetails from "./pages/G_RoomDetails";
import GReservations from "./pages/G_Reservations";
import GRoomReservation from "./pages/G_RoomReservation";
import GReservationsEventDetails from "./pages/G_EventReservationsEventDetails";
import GReservationsRoomDetails from "./pages/G_RoomReservationsRoomDetails";

import GVirtualTour from "./pages/G_VirtualTour";

import ALogin from "./manager_pages/A_Login";

import MDashboard from "./manager_pages/M_Dashboard";
import MDashboard2 from "./manager_pages/M_Dashboard_2";
import MHome from "./manager_pages/M_Home";
import MAccounts from "./manager_pages/M_Accounts";
import MRoom from "./manager_pages/M_Room";
import MFood from "./manager_pages/M_Food";
import MDrink from "./manager_pages/M_Drink";
import MConcierge from "./manager_pages/M_Concierge";
import MLaundry from "./manager_pages/M_Laundry";
import MVenue from "./manager_pages/M_Venue";
import MFoodPackage from "./manager_pages/M_FoodPackage";
import MReportSales from "./manager_pages/M_ReportSales";
import MReportMenuOp from "./manager_pages/M_ReportMenuOp";
import MReportForecasting from "./manager_pages/M_ReportForecasting";
import MReportRoomOccupancy from "./manager_pages/M_ReportRoomOccupancy";
import MADashboard from "./manager_pages/MA_Dashboard";
import MAAccounts from "./manager_pages/MA_Accounts";
import MARooms from "./manager_pages/MA_Rooms";
import MAFoods from "./manager_pages/MA_Foods";
import MADrinks from "./manager_pages/MA_Drinks";
import MAConcierges from "./manager_pages/MA_Concierge";
import MALaundry from "./manager_pages/MA_Laundry";
import MAPackages from "./manager_pages/MA_Packages";
import MAVenues from "./manager_pages/MA_Venues";


import FDashboard from "./frontdesk_pages/F_Dashboard";
import FHome from "./frontdesk_pages/F_Home";
import FRoomWalkIn from "./frontdesk_pages/F_RoomWalkIn";
import FRoomBook from "./frontdesk_pages/F_RoomBook";
import FEventWalkIn from "./frontdesk_pages/F_EventWalkIn";
import FRoomReservation from "./frontdesk_pages/F_RoomReservation";
import FConciergeLaundry from "./frontdesk_pages/F_ConciergeLaundry";
import FAdditionalItem from "./frontdesk_pages/F_AdditionalItem";
import FMainHouse from "./frontdesk_pages/F_Main_House";
import FEventReservation from "./frontdesk_pages/F_EventReservation";
import CheckInTable from "./frontdesk_components/CheckIn";

import RHomeRestaurant from "./restaurant_pages/R_Home";
import RDashboard from "./restaurant_pages/R_Dashboard";
import RDashboard2 from "./restaurant_pages/R_Dashboard2";
import RAllOrders from "./restaurant_pages/R_AllOrders";
import ROrder from "./restaurant_pages/R_Order";
import RIncomingOrder from "./restaurant_pages/R_IncomingOrder";
import RProceedRestaurant from "./restaurant_pages/R_ProceedOrder";
import RTableMain from "./restaurant_pages/R_TableMain";
import RTablReservations from "./restaurant_pages/R_TableRevservation";
import RTableRevCalendar from "./restaurant_pages/R_TableCalendar";

import BHomeBar from "./bar_pages/B_Home";
import BDashboard from "./bar_pages/B_Dashboard";
import BAllOrders from "./bar_pages/B_AllOrders";
import BOrder from "./bar_pages/B_Order";
import BIncomingOrder from "./bar_pages/B_IncomingOrder";
import BProceedBarOrder from "./bar_pages/B_ProceedBar";
import FCheckInTable from "./frontdesk_pages/F_CheckIn";

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GLogin/>}/>
        <Route path="/register" element={<GRegister/>}/>
        <Route path="/profile_guest" element={<GProfile/>}/>

        <Route path="/room_search" element={<GRoomSearch/>}/>
        <Route path="/room_details/:roomId" element={<GRoomDetails/>}/>
        <Route path="/room_search/book_room_reservations" element={<GRoomReservation/>}/>

        <Route path="/reservations" element={<GReservations/>}/>
        <Route path="/reservations/room_reservation_details/:room_reservation_id" element={<GReservationsRoomDetails/>}/>
        <Route path="/reservations/event_reservation_details/:event_reservation_id" element={<GReservationsEventDetails/>}/>
        <Route path = "/virtual_tour" element ={<GVirtualTour/>}/>


        <Route path="/faq" element={<GFaq/>}/>
        <Route path="/terms_and_conditions" element={<GTerms/>}/>
        <Route path="/cancel_policy" element={<GCancel/>}/>
        <Route path="/website_data_policy" element={<GWebsiteData/>}/>

        <Route path="/" element={<GHome/>}/>
        <Route path = "/about_us" element ={<GAbout/>}/>
        <Route path = "/contact_us" element ={<GContact/>}/>

        <Route path="/event_filtering" element={<GEvent_1/>}/>
        <Route path="/resturant_filtering" element={<GResturant_1/>}/>
        <Route path="/resturant_tables" element={<GResturant_2/>}/>

        <Route path = "/staff_login" element ={<ALogin/>}/>

        <Route path = "/manager_dashboard" element ={<MDashboard/>}/>
        <Route path = "/manager_dashboard_reports" element ={<MDashboard2/>}/>
        <Route path = "/manager_home" element ={<MHome/>}/>
        <Route path = "/manager_accounts" element ={<MAccounts/>}/>
        <Route path = "/manager_room" element ={<MRoom/>}/>
        <Route path = "/manager_food" element ={<MFood/>}/>
        <Route path = "/manager_drink" element ={<MDrink/>}/>
        <Route path = "/manager_concierge" element ={<MConcierge/>}/>
        <Route path = "/manager_laundry" element ={<MLaundry/>}/>
        <Route path = "/manager_venue" element ={<MVenue/>}/>
        <Route path = "/manager_food_package" element ={<MFoodPackage/>}/>
        <Route path = "/manager_report_sales" element ={<MReportSales/>}/>
        <Route path = "/manager_report_menu_optimization" element ={<MReportMenuOp/>}/>
        <Route path = "/manager_report_room_occupancy_rate" element ={<MReportRoomOccupancy/>}/>
        <Route path = "/manager_report_forecasting" element ={<MReportForecasting/>}/>

        <Route path = "/manager_archive_dashboard" element ={<MADashboard/>}/>
        <Route path = "/manager_archive_accounts" element ={<MAAccounts/>}/>
        <Route path = "/manager_archive_rooms" element ={<MARooms/>}/>
        <Route path = "/manager_archive_foods" element ={<MAFoods/>}/>
        <Route path = "/manager_archive_drinks" element ={<MADrinks/>}/>
        <Route path = "/manager_archive_concierges" element ={<MAConcierges/>}/>
        <Route path = "/manager_archive_laundry" element ={<MALaundry/>}/>
        <Route path = "/manager_archive_packages" element ={<MAPackages/>}/>
        <Route path = "/manager_archive_venues" element ={<MAVenues/>}/>



        <Route path = "/frontdesk_dashboard" element ={<FDashboard/>}/>
        <Route path = "/frontdesk_home" element ={<FHome/>}/>
        <Route path = "/frontdesk_room_walk_in" element ={<FRoomWalkIn/>}/>
        <Route path = "/frontdesk_room_walk_in/room_booking" element ={<FRoomBook/>}/>
        <Route path="/frontdesk_event_walk_in" element={<FEventWalkIn/>}/>
        <Route path="/frontdesk_room_reservation" element={<FRoomReservation/>}/>
        <Route path ="/frontdesk_concierge_and_laundry" element={<FConciergeLaundry/>}/>
        <Route path="/frontdesk_additional_item" element={<FAdditionalItem/>}/>
        <Route path="/frontdesk_maintenance_and_housekeeping" element={<FMainHouse/>}/>
        <Route path="/frontdesk_event_reservation" element={<FEventReservation/>}></Route>
        <Route path="/frontdesk_check_in" element={<FCheckInTable/>}></Route>

        
        
        <Route path = "/restaurant_home" element ={<RHomeRestaurant/>}/>
        <Route path = "/restaurant_dashboard" element ={<RDashboard/>}/>
        <Route path = "/restaurant_dashboard_table" element ={<RDashboard2/>}/>
        <Route path = "/restaurant_all_orders" element ={<RAllOrders/>}/>
        <Route path = "/restaurant_order" element ={<ROrder/>}/>
        <Route path = "/restaurant_incoming_orders" element ={<RIncomingOrder/>}/>
        <Route path ="/restaurant_order/proceed_order" element={<RProceedRestaurant/>}/>
        <Route path = "/restaurant_table_maintenance" element ={<RTableMain/>}/>
        <Route path = "/restaurant_table_reservations" element ={<RTablReservations/>}/>
        <Route path = "/restaurant_table_reservations_calendar" element ={<RTableRevCalendar/>}/>


        <Route path = "/bar_home" element ={<BHomeBar/>}/>
        <Route path = "/bar_dashboard" element ={<BDashboard/>}/>
        <Route path = "/bar_all_orders" element ={<BAllOrders/>}/>
        <Route path = "/bar_order" element ={<BOrder/>}/>
        <Route path = "/bar_incoming_orders" element ={<BIncomingOrder/>}/>
        <Route path = "/bar_order/proceed_order" element ={<BProceedBarOrder/>}/>

      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
