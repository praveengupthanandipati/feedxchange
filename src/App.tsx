import './assets/styles/App.scss'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SelectedContractProvider } from './context/SelectedContractContext'
import { AuthProvider } from './auth/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Contracts from './pages/contracts/Contracts'
import ContractDetail from './pages/contracts/ContractDetail'
import NewContract from './pages/contracts/NewContract'
import Businessowners from './pages/usermanagement/businessowners/BusinessList/Businessowners'
import BusinessOwnerDetail from './pages/usermanagement/businessowners/BusinessView/BusinessOwnerDetail'
import BusinessOwnerWizardLayout from './pages/usermanagement/businessowners/BusinessNew/BusinessOwnerWizardLayout'
import BusinessProfileStep from './pages/usermanagement/businessowners/BusinessNew/BusinessProfileStep'
import ContactsAddressesStep from './pages/usermanagement/businessowners/BusinessNew/ContactsAddressesStep'
import DocumentsStep from './pages/usermanagement/businessowners/BusinessNew/DocumentsStep'
import BankDetailsStep from './pages/usermanagement/businessowners/BusinessNew/BankDetailsStep'
import ProfileSettingsStep from './pages/usermanagement/businessowners/BusinessNew/ProfileSettingsStep'
import Transprters from './pages/usermanagement/transporters/transportersList/Transprters'
import TransporterWizardLayout from './pages/usermanagement/transporters/transportersNew/TransporterWizardLayout'
import TransporterProfileStep from './pages/usermanagement/transporters/transportersNew/TransporterProfileStep'
import TransporterContactsAddressesStep from './pages/usermanagement/transporters/transportersNew/ContactsAddressesStep'
import TransporterDocumentsStep from './pages/usermanagement/transporters/transportersNew/DocumentsStep'
import TransporterBankDetailsStep from './pages/usermanagement/transporters/transportersNew/BankDetailsStep'
import TransporterProfileSettingsStep from './pages/usermanagement/transporters/transportersNew/ProfileSettingsStep'
import Transportview from './pages/usermanagement/transporters/transportView/Transportview'
import Promoterlist from './pages/usermanagement/promoters/promoterslist/Promoterlist'
import PromoterWizardLayout from './pages/usermanagement/promoters/promoternew/PromoterWizardLayout'
import PromoterProfileStep from './pages/usermanagement/promoters/promoternew/PromoterProfileStep'
import PromoterDocumentsStep from './pages/usermanagement/promoters/promoternew/DocumentsStep'
import PromoterProfileSettingsStep from './pages/usermanagement/promoters/promoternew/ProfileSettingsStep'
import Promoterview from './pages/usermanagement/promoters/promoterview/Promoterview'
import Categories from './pages/product-management/categories/Categories'
import Products from './pages/product-management/products/products-list/Products'
import NewProduct from './pages/product-management/products/product-new/ProductNew'
import Productview from './pages/product-management/products/product-view/Productview'
import ContractchangeStatus from './pages/contracts/contract-status/ContractchangeStatus'
import PromoterDashboard from './pages/usermanagement/promoters/promoterdashboard/PromoterDashboard'
import Promocodes from './pages/usermanagement/promoters/promocodes/Promocodes'
import ReferredProfiles from './pages/usermanagement/promoters/referredprofiles/ReferredProfiles'
import ProductPriceTracking from './pages/product-management/price-tracking/ProductPriceTracking'
import Notifications from './pages/product-management/notifications/Notifications'
import CreateInterest from './pages/interest-payments/create-interest/CreateInterest'
import ViewInterest from './pages/interest-payments/view-interest/ViewInterest'
import InterestDetail from './pages/interest-payments/interest-detail/InterestDetail'
import GenerateInvoice from './pages/company-invoices/generate-invoice/GenerateInvoice'
import CommissionEstimations from './pages/estimations/commission-estimations/CommissionEstimations'
import ViewEstimations from './pages/estimations/view-estimations/ViewEstimations'
import EstimationDetail from './pages/estimations/estimations-detail/EstimationDetail'
import Banners from './pages/masters/banners/Banners'
import Subscriptions from './pages/masters/subscriptions/Subscriptions'
import ProductEnquiries from './pages/masters/product-enquiries/ProductEnquiries'
import ViewInvoices from './pages/company-invoices/view-invoices/ViewInvoices'
import PriceHistory from './pages/product-management/price-history/ProductPrieHistory'
import FormulaCalculations from './pages/product-management/formula-calculations/FormulaCalculations'
import PendingContracts from './pages/truck-management/pending-contracts/PendingContracts'
import OpenPendingContracts from './pages/truck-management/open-pending-contracts/PendingContracts'
import AddInstantTruck from './pages/truck-management/open-pending-contracts/contract-trucks/instant-trucks/AddInstantTruck'
import ScheduleDispatch from './pages/truck-management/open-pending-contracts/contract-trucks/schedule-trucks/ScheduleDispatch'
import ViewTrucksByContract from './pages/truck-management/open-pending-contracts/contract-trucks/view-trucks/ViewTrucksByContract'
import AddTruckToSchedule from './pages/truck-management/open-pending-contracts/contract-trucks/add-truck-to-schedule/AddTruckToSchedule'
import ManageSchedule from './pages/truck-management/open-pending-contracts/contract-trucks/manage-schedule/ManageSchedule'
import UpdateTruckStatus from './pages/truck-management/open-pending-contracts/contract-trucks/update-truck-status/UpdateTruckStatus'
import ReassignTruck from './pages/truck-management/open-pending-contracts/contract-trucks/reassign-truck/ReassignTruck'
import ContractTruckChain from './pages/truck-management/open-pending-contracts/contract-trucks/truck-chain/ContractTruckChain'
// import BulkFreightApproval from './pages/truck-management/bulk-freight-approval/BulkFreightApproval'
import Assigntransports from './pages/truck-management/assign-transports/Assigntransports'
import DriversList from './pages/transporters/drivers/drivers-list/DriversList'
import DriverNew from './pages/transporters/drivers/driver-create/NewDriver'
import DriverView from './pages/transporters/drivers/driver-view/DriverView'
import TrucksList from './pages/transporters/truck-master/trucks-list/TrucksList'
import TruckNew from './pages/transporters/truck-master/truck-new/TruckNew'
import TrucksView from './pages/transporters/truck-master/truck-view/TruckView'
import DriverTruckMapping from './pages/transporters/driver-trucks-mapping/driver-trucks-list/DriverTruckMapping'
import TruckTrips from './pages/transporters/truck-trip-management/truck-trip-list/TruckTrip'
import TruckTripNew from './pages/transporters/truck-trip-management/truck-new-trip/TruckNewTrip'
import TruckTripView from './pages/transporters/truck-trip-management/truck-trip-view/TruckTripView'
import TransporterDashboard from './pages/transporters/transporter-dashboard/TransporterDb'
// import TransporReviewAssignTrucks from './pages/truck-management/transporter-review-assign-trucks/ReviewAndAssignTrucks'
import PendingDeliveryOrders from './pages/truck-management/pending-dos/PendingDeliveryOrders'
import Sellerdispatch from './pages/truck-management/add-dispatch-byuser/Sellerdispatch'
import SellerDispatches from './pages/truck-management/seller-dispatches-new/seller-dispatches/SellerDispatches'
import UpdateSellerDispatch from './pages/truck-management/seller-dispatches-new/update-seller-dispatch/UpdateSellerDispatch'
import SellerTruckReview from './pages/truck-management/seller-truck-review/SellerTruckReview'


//reports
import SellerInvoiceReports from './pages/reports/seller-invoice-reports/SellerInvoiceReports'
import SellerBuyerAccounts from './pages/reports/seller-buyer-accounts/SellerBuyerAccounts'
import ContractWiseStatus from './pages/reports/contract-wise-status/ContractwiseStatus'
import ContractSummary from './pages/reports/contract-summary/ContractSummary'
import AccountStatement from './pages/reports/account-statement/AccountStatement'
import PendingPayments from './pages/reports/pending-payments/PendingPayments'
import PendingSupplies from './pages/reports/pending-supplies/PendingSupplies'
import MonthlyReports from './pages/reports/monthly-reports/MonthlyReports'

//payment
import Sellerinvoice from './pages/payments/seller-invoice/SellerInvoice'
import EditSellerInvoices from './pages/payments/edit-seller-invoices/EditSellerInvoices'
import Paymentadvice from './pages/payments/payment-advice/Paymentadvice'
import PaymentAllocation from './pages/payments/payment-allocation/PaymentAllocation'
import Refunds from './pages/payments/refunds/Refunds'


import SubModuleOverview from './pages/overview/SubModuleOverview'
import RoleAccess from './pages/roles/RoleAccess'
import UserAccess from './pages/roles/UserAccess'


function App() {
  return (
    <AuthProvider>
    <SelectedContractProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>

          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/contracts/new" element={<NewContract />} />
          <Route path="/business-owners" element={<Businessowners />} />
          <Route path="/business-owners/:id" element={<BusinessOwnerDetail />} />
          <Route element={<BusinessOwnerWizardLayout />}>
            <Route path="/business-owners/profile" element={<BusinessProfileStep />} />
            <Route path="/business-owners/contacts" element={<ContactsAddressesStep />} />
            <Route path="/business-owners/documents" element={<DocumentsStep />} />
            <Route path="/business-owners/bank-details" element={<BankDetailsStep />} />
            <Route path="/business-owners/profile-settings" element={<ProfileSettingsStep />} />
          </Route>
          <Route path="/transporters" element={<Transprters />} />
          <Route path="/transporters/:id" element={<Transportview />} />
          <Route element={<TransporterWizardLayout />}>
            <Route path="/transporters/profile" element={<TransporterProfileStep />} />
            <Route path="/transporters/contacts" element={<TransporterContactsAddressesStep />} />
            <Route path="/transporters/documents" element={<TransporterDocumentsStep />} />
            <Route path="/transporters/bank-details" element={<TransporterBankDetailsStep />} />
            <Route path="/transporters/profile-settings" element={<TransporterProfileSettingsStep />} />
          </Route>
          <Route path="/promoters" element={<Promoterlist />} />
          <Route path="/promoters/:id" element={<Promoterview />} />
          <Route element={<PromoterWizardLayout />}>
            <Route path="/promoters/profile" element={<PromoterProfileStep />} />
            <Route path="/promoters/documents" element={<PromoterDocumentsStep />} />
            <Route path="/promoters/profile-settings" element={<PromoterProfileSettingsStep />} />
          </Route>
          <Route path="/categories" element={<Categories />} />
          <Route path="/payments/overview" element={<SubModuleOverview />} />
          <Route path="/reports/overview" element={<SubModuleOverview />} />
          <Route path="/product-management/overview" element={<SubModuleOverview />} />
          <Route path="/truck-management/transporters/overview" element={<SubModuleOverview />} />
          <Route path="/menu-management/overview" element={<SubModuleOverview />} />
          <Route path="/menu-management/assign-role" element={<RoleAccess />} />
          <Route path="/menu-management/assign-user" element={<UserAccess />} />
          {/* the earlier addresses of these two screens */}
          <Route path="/roles-permissions" element={<Navigate to="/menu-management/assign-role" replace />} />
          <Route path="/user-access" element={<Navigate to="/menu-management/assign-user" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<NewProduct />} />
          <Route path="/products/:id" element={<Productview />} />
          <Route path="/contract-status" element={<ContractchangeStatus />} />
          <Route path="/promoter-dashboard" element={<PromoterDashboard />} />
          <Route path="/promocodes" element={<Promocodes />} />
          <Route path="/referred-profiles" element={<ReferredProfiles />} />
          <Route path="/products/price-tracking" element={<ProductPriceTracking />} />
          <Route path="/products/price-history" element={<PriceHistory />} />
          <Route path="/products/formula-calculations" element={<FormulaCalculations />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/interest-payments/overview" element={<SubModuleOverview />} />
          <Route path="/interest-payments/create" element={<CreateInterest />} />
          <Route path="/interest-payments/view" element={<ViewInterest />} />
          <Route path="/interest-payments/detail" element={<InterestDetail />} />
          <Route path="/company-invoices/overview" element={<SubModuleOverview />} />
          <Route path="/estimations/overview" element={<SubModuleOverview />} />
          <Route path="/estimations/commission" element={<CommissionEstimations />} />
          <Route path="/estimations/view" element={<ViewEstimations />} />
          <Route path="/estimations/detail" element={<EstimationDetail />} />
          <Route path="/masters/overview" element={<SubModuleOverview />} />
          <Route path="/masters/banners" element={<Banners />} />
          <Route path="/masters/subscriptions" element={<Subscriptions />} />
          <Route path="/masters/product-enquiry" element={<ProductEnquiries />} />
          <Route path="/company-invoices/generate" element={<GenerateInvoice />} />
          <Route path="/company-invoices/view" element={<ViewInvoices />} />
          <Route path="/truck-management/pending-contracts" element={<PendingContracts />} />
          <Route path="/truck-management/pending-delivery-orders" element={<PendingDeliveryOrders />} />
          <Route path="/truck-management/add-dispatch-by-user" element={<Sellerdispatch />} />
          <Route path="/truck-management/seller-dispatches-new" element={<SellerDispatches />} />
          <Route path="/truck-management/seller-dispatches-new/update/:contractNo" element={<UpdateSellerDispatch />} />
          <Route path="/truck-management/pending-delivery-orders/seller-truck-review/:id" element={<SellerTruckReview />} />
          <Route path="/truck-management/open-pending-contracts" element={<OpenPendingContracts />} />
          <Route path="/truck-management/open-pending-contracts/instant-truck" element={<AddInstantTruck />} />
          <Route path="/truck-management/open-pending-contracts/schedule-dispatch" element={<ScheduleDispatch />} />
          <Route path="/truck-management/open-pending-contracts/view-trucks" element={<ViewTrucksByContract />} />
          <Route path="/truck-management/open-pending-contracts/reassign-truck" element={<ReassignTruck />} />
          <Route path="/truck-management/open-pending-contracts/truck-chain" element={<ContractTruckChain />} />
          <Route path="/truck-management/open-pending-contracts/manage-schedule" element={<ManageSchedule />} />
          <Route
            path="/truck-management/open-pending-contracts/add-truck-to-schedule"
            element={<AddTruckToSchedule />}
          />
          <Route
            path="/truck-management/open-pending-contracts/update-truck-status"
            element={<UpdateTruckStatus />}
          />

          {/* <Route path="/truck-management/bulk-freight-approval" element={<BulkFreightApproval />} /> */}
          <Route path="/truck-management/assign-transports" element={<Assigntransports />} />
          <Route path="/truck-management/transporters/driver-master" element={<DriversList />} />
          <Route path="/truck-management/transporters/driver-master/new" element={<DriverNew />} />
          <Route path="/truck-management/transporters/driver-master/:id" element={<DriverView />} />
          <Route path="/truck-management/transporters/truck-master" element={<TrucksList />} />
          <Route path="/truck-management/transporters/truck-master/new" element={<TruckNew />} />
          <Route path="/truck-management/transporters/truck-master/:id" element={<TrucksView />} />
          <Route path="/truck-management/transporters/driver-truck-mapping" element={<DriverTruckMapping />} />
          <Route path="/truck-management/transporters/truck-trips" element={<TruckTrips />} />
          <Route path="/truck-management/transporters/truck-trips/new" element={<TruckTripNew />} />
          <Route path="/truck-management/transporters/truck-trips/:id" element={<TruckTripView />} />
          <Route path="/truck-management/pending-dos" element={<PendingDeliveryOrders />} />
          <Route path="/truck-management/seller-truck-review" element={<SellerTruckReview />} />
          <Route path="/truck-management/transporters/dashboard" element={<TransporterDashboard />} />
          <Route path="/truck-management/transporters/transport-dashboard" element={<TransporterDashboard />} />
          {/* <Route path="/truck-management/transporters/freight-approval" element={<TransporReviewAssignTrucks />} /> */}
          <Route path="/reports/seller-invoice-reports" element={<SellerInvoiceReports />} />
          <Route path="/reports/seller-buyer-accounts" element={<SellerBuyerAccounts />} />
          <Route path="/reports/contract-wise-status" element={<ContractWiseStatus />} />
          <Route path="/reports/contract-summary" element={<ContractSummary />} />
          <Route path="/reports/account-statement" element={<AccountStatement />} />
          <Route path="/reports/pending-payments" element={<PendingPayments />} />
          <Route path="/reports/pending-supplies" element={<PendingSupplies />} />
          <Route path="/reports/monthly-reports" element={<MonthlyReports />} />
          <Route path="/payments/seller-invoice" element={<Sellerinvoice />} />
          <Route path="/payments/seller-invoice-edit" element={<EditSellerInvoices />} />
          <Route path="/payments/payment-advice" element={<Paymentadvice />} />
          <Route path="/payments/payment-allocation" element={<PaymentAllocation />} />
          <Route path="/payments/refunds" element={<Refunds />} />
        </Route>
      </Routes>
    </Router>
    </SelectedContractProvider>
    </AuthProvider>
  )
}

export default App
