import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import AdminNotFound from "./not-found/AdminNotFound";

// Every admin screen is loaded on demand, so signing in downloads only the shell and the screen being opened.
const NotificationPreferences = lazy(() => import("./notification-preferences/NotificationPreferences"));
const MyNotificationPreferences = lazy(() => import("./notification-preferences/MyNotificationPreferences"));
const ContractNotificationHistory = lazy(() => import("./notifications/ContractNotificationHistory"));
const NotificationsCenter = lazy(() => import("./notifications/NotificationsCenter"));
const TemplateAdmin = lazy(() => import("./notifications/TemplateAdmin"));
const Dashboard = lazy(() => import("./dashboard/Dashboard"));
const Contracts = lazy(() => import("./contracts/Contracts"));
const ContractDetail = lazy(() => import("./contracts/ContractDetail"));
const NewContract = lazy(() => import("./contracts/NewContract"));
const Businessowners = lazy(() => import("./usermanagement/businessowners/BusinessList/Businessowners"));
const BusinessOwnerDetail = lazy(() => import("./usermanagement/businessowners/BusinessView/BusinessOwnerDetail"));
const BusinessOwnerWizardLayout = lazy(() => import("./usermanagement/businessowners/BusinessNew/BusinessOwnerWizardLayout"));
const BusinessProfileStep = lazy(() => import("./usermanagement/businessowners/BusinessNew/BusinessProfileStep"));
const ContactsAddressesStep = lazy(() => import("./usermanagement/businessowners/BusinessNew/ContactsAddressesStep"));
const DocumentsStep = lazy(() => import("./usermanagement/businessowners/BusinessNew/DocumentsStep"));
const BankDetailsStep = lazy(() => import("./usermanagement/businessowners/BusinessNew/BankDetailsStep"));
const ProfileSettingsStep = lazy(() => import("./usermanagement/businessowners/BusinessNew/ProfileSettingsStep"));
const Transprters = lazy(() => import("./usermanagement/transporters/transportersList/Transprters"));
const TransporterWizardLayout = lazy(() => import("./usermanagement/transporters/transportersNew/TransporterWizardLayout"));
const TransporterProfileStep = lazy(() => import("./usermanagement/transporters/transportersNew/TransporterProfileStep"));
const TransporterContactsAddressesStep = lazy(() => import("./usermanagement/transporters/transportersNew/ContactsAddressesStep"));
const TransporterDocumentsStep = lazy(() => import("./usermanagement/transporters/transportersNew/DocumentsStep"));
const TransporterBankDetailsStep = lazy(() => import("./usermanagement/transporters/transportersNew/BankDetailsStep"));
const TransporterProfileSettingsStep = lazy(() => import("./usermanagement/transporters/transportersNew/ProfileSettingsStep"));
const Transportview = lazy(() => import("./usermanagement/transporters/transportView/Transportview"));
const Promoterlist = lazy(() => import("./usermanagement/promoters/promoterslist/Promoterlist"));
const PromoterWizardLayout = lazy(() => import("./usermanagement/promoters/promoternew/PromoterWizardLayout"));
const PromoterProfileStep = lazy(() => import("./usermanagement/promoters/promoternew/PromoterProfileStep"));
const PromoterDocumentsStep = lazy(() => import("./usermanagement/promoters/promoternew/DocumentsStep"));
const PromoterProfileSettingsStep = lazy(() => import("./usermanagement/promoters/promoternew/ProfileSettingsStep"));
const Promoterview = lazy(() => import("./usermanagement/promoters/promoterview/Promoterview"));
const Categories = lazy(() => import("./product-management/categories/Categories"));
const Products = lazy(() => import("./product-management/products/products-list/Products"));
const NewProduct = lazy(() => import("./product-management/products/product-new/ProductNew"));
const Productview = lazy(() => import("./product-management/products/product-view/Productview"));
const ContractchangeStatus = lazy(() => import("./contracts/contract-status/ContractchangeStatus"));
const PromoterDashboard = lazy(() => import("./usermanagement/promoters/promoterdashboard/PromoterDashboard"));
const Promocodes = lazy(() => import("./usermanagement/promoters/promocodes/Promocodes"));
const ReferredProfiles = lazy(() => import("./usermanagement/promoters/referredprofiles/ReferredProfiles"));
const ProductPriceTracking = lazy(() => import("./product-management/price-tracking/ProductPriceTracking"));
const CreateInterest = lazy(() => import("./interest-payments/create-interest/CreateInterest"));
const ViewInterest = lazy(() => import("./interest-payments/view-interest/ViewInterest"));
const InterestDetail = lazy(() => import("./interest-payments/interest-detail/InterestDetail"));
const GenerateInvoice = lazy(() => import("./company-invoices/generate-invoice/GenerateInvoice"));
const CommissionEstimations = lazy(() => import("./estimations/commission-estimations/CommissionEstimations"));
const ViewEstimations = lazy(() => import("./estimations/view-estimations/ViewEstimations"));
const EstimationDetail = lazy(() => import("./estimations/estimations-detail/EstimationDetail"));
const Banners = lazy(() => import("./masters/banners/Banners"));
const Subscriptions = lazy(() => import("./masters/subscriptions/Subscriptions"));
const ProductEnquiries = lazy(() => import("./masters/product-enquiries/ProductEnquiries"));
const Contactenquiry = lazy(() => import("./masters/contact-enquiry/Contactenquiry"));
const Testimonials = lazy(() => import("./masters/testimonials/Testimonials"));
const Blogs = lazy(() => import("./masters/blogs/Blogs"));
const Users = lazy(() => import("./masters/users/Users"));
const RegistrationDetails = lazy(() => import("./masters/registration-details/RegistrationDetails"));
const Settings = lazy(() => import("./settings/Settings"));
const ViewInvoices = lazy(() => import("./company-invoices/view-invoices/ViewInvoices"));
const PriceHistory = lazy(() => import("./product-management/price-history/ProductPrieHistory"));
const FormulaCalculations = lazy(() => import("./product-management/formula-calculations/FormulaCalculations"));
const PendingContracts = lazy(() => import("./truck-management/pending-contracts/PendingContracts"));
const OpenPendingContracts = lazy(() => import("./truck-management/open-pending-contracts/PendingContracts"));
const AddInstantTruck = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/instant-trucks/AddInstantTruck"));
const ScheduleDispatch = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/schedule-trucks/ScheduleDispatch"));
const ViewTrucksByContract = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/view-trucks/ViewTrucksByContract"));
const AddTruckToSchedule = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/add-truck-to-schedule/AddTruckToSchedule"));
const ManageSchedule = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/manage-schedule/ManageSchedule"));
const UpdateTruckStatus = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/update-truck-status/UpdateTruckStatus"));
const ReassignTruck = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/reassign-truck/ReassignTruck"));
const ContractTruckChain = lazy(() => import("./truck-management/open-pending-contracts/contract-trucks/truck-chain/ContractTruckChain"));
const Assigntransports = lazy(() => import("./truck-management/assign-transports/Assigntransports"));
const DriversList = lazy(() => import("./transporters/drivers/drivers-list/DriversList"));
const DriverNew = lazy(() => import("./transporters/drivers/driver-create/NewDriver"));
const DriverView = lazy(() => import("./transporters/drivers/driver-view/DriverView"));
const TrucksList = lazy(() => import("./transporters/truck-master/trucks-list/TrucksList"));
const TruckNew = lazy(() => import("./transporters/truck-master/truck-new/TruckNew"));
const TrucksView = lazy(() => import("./transporters/truck-master/truck-view/TruckView"));
const DriverTruckMapping = lazy(() => import("./transporters/driver-trucks-mapping/driver-trucks-list/DriverTruckMapping"));
const TruckTrips = lazy(() => import("./transporters/truck-trip-management/truck-trip-list/TruckTrip"));
const TruckTripNew = lazy(() => import("./transporters/truck-trip-management/truck-new-trip/TruckNewTrip"));
const TruckTripView = lazy(() => import("./transporters/truck-trip-management/truck-trip-view/TruckTripView"));
const TransporterDashboard = lazy(() => import("./transporters/transporter-dashboard/TransporterDb"));
const PendingDeliveryOrders = lazy(() => import("./truck-management/pending-dos/PendingDeliveryOrders"));
const Sellerdispatch = lazy(() => import("./truck-management/add-dispatch-byuser/Sellerdispatch"));
const SellerDispatches = lazy(() => import("./truck-management/seller-dispatches-new/seller-dispatches/SellerDispatches"));
const UpdateSellerDispatch = lazy(() => import("./truck-management/seller-dispatches-new/update-seller-dispatch/UpdateSellerDispatch"));
const SellerTruckReview = lazy(() => import("./truck-management/seller-truck-review/SellerTruckReview"));
const SellerInvoiceReports = lazy(() => import("./reports/seller-invoice-reports/SellerInvoiceReports"));
const SellerBuyerAccounts = lazy(() => import("./reports/seller-buyer-accounts/SellerBuyerAccounts"));
const ContractWiseStatus = lazy(() => import("./reports/contract-wise-status/ContractwiseStatus"));
const ContractSummary = lazy(() => import("./reports/contract-summary/ContractSummary"));
const AccountStatement = lazy(() => import("./reports/account-statement/AccountStatement"));
const PendingPayments = lazy(() => import("./reports/pending-payments/PendingPayments"));
const PendingSupplies = lazy(() => import("./reports/pending-supplies/PendingSupplies"));
const MonthlyReports = lazy(() => import("./reports/monthly-reports/MonthlyReports"));
const Sellerinvoice = lazy(() => import("./payments/seller-invoice/SellerInvoice"));
const EditSellerInvoices = lazy(() => import("./payments/edit-seller-invoices/EditSellerInvoices"));
const Paymentadvice = lazy(() => import("./payments/payment-advice/Paymentadvice"));
const PaymentAllocation = lazy(() => import("./payments/payment-allocation/PaymentAllocation"));
const Refunds = lazy(() => import("./payments/refunds/Refunds"));
const SubModuleOverview = lazy(() => import("./overview/SubModuleOverview"));
const RoleAccess = lazy(() => import("./roles/RoleAccess"));
const UserAccess = lazy(() => import("./roles/UserAccess"));

/**
 * The admin application's routes, relative to /admin (the shell in app.routes.tsx mounts them there, behind the login check and the
 * admin layout). Paths are written without the prefix; "index" is /admin itself.
 */
export const adminRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="settings" element={<Settings />} />
    <Route path="contracts" element={<Contracts />} />
    <Route path="contracts/:id" element={<ContractDetail />} />
    <Route path="contracts/:id/notifications" element={<ContractNotificationHistory />} />
    <Route path="notifications" element={<NotificationsCenter />} />
    <Route path="notification-templates" element={<TemplateAdmin />} />
    <Route path="notification-preferences" element={<NotificationPreferences />} />
    <Route path="my-notification-preferences" element={<MyNotificationPreferences />} />
    <Route path="contracts/new" element={<NewContract />} />
    <Route path="business-owners" element={<Businessowners />} />
    <Route path="business-owners/:id" element={<BusinessOwnerDetail />} />
    <Route element={<BusinessOwnerWizardLayout />}>
      <Route path="business-owners/profile" element={<BusinessProfileStep />} />
      <Route path="business-owners/contacts" element={<ContactsAddressesStep />} />
      <Route path="business-owners/documents" element={<DocumentsStep />} />
      <Route path="business-owners/bank-details" element={<BankDetailsStep />} />
      <Route path="business-owners/profile-settings" element={<ProfileSettingsStep />} />
    </Route>
    <Route path="transporters" element={<Transprters />} />
    <Route path="transporters/:id" element={<Transportview />} />
    <Route element={<TransporterWizardLayout />}>
      <Route path="transporters/profile" element={<TransporterProfileStep />} />
      <Route path="transporters/contacts" element={<TransporterContactsAddressesStep />} />
      <Route path="transporters/documents" element={<TransporterDocumentsStep />} />
      <Route path="transporters/bank-details" element={<TransporterBankDetailsStep />} />
      <Route path="transporters/profile-settings" element={<TransporterProfileSettingsStep />} />
    </Route>
    <Route path="promoters" element={<Promoterlist />} />
    <Route path="promoters/:id" element={<Promoterview />} />
    <Route element={<PromoterWizardLayout />}>
      <Route path="promoters/profile" element={<PromoterProfileStep />} />
      <Route path="promoters/documents" element={<PromoterDocumentsStep />} />
      <Route path="promoters/profile-settings" element={<PromoterProfileSettingsStep />} />
    </Route>
    <Route path="categories" element={<Categories />} />
    <Route path="payments/overview" element={<SubModuleOverview />} />
    <Route path="reports/overview" element={<SubModuleOverview />} />
    <Route path="product-management/overview" element={<SubModuleOverview />} />
    <Route path="truck-management/transporters/overview" element={<SubModuleOverview />} />
    <Route path="menu-management/overview" element={<SubModuleOverview />} />
    <Route path="menu-management/assign-role" element={<RoleAccess />} />
    <Route path="menu-management/assign-user" element={<UserAccess />} />
    <Route path="roles-permissions" element={<Navigate to="/admin/menu-management/assign-role" replace />} />
    <Route path="user-access" element={<Navigate to="/admin/menu-management/assign-user" replace />} />
    <Route path="products" element={<Products />} />
    <Route path="products/new" element={<NewProduct />} />
    <Route path="products/:id" element={<Productview />} />
    <Route path="contract-status" element={<ContractchangeStatus />} />
    <Route path="promoter-dashboard" element={<PromoterDashboard />} />
    <Route path="promocodes" element={<Promocodes />} />
    <Route path="referred-profiles" element={<ReferredProfiles />} />
    <Route path="products/price-tracking" element={<ProductPriceTracking />} />
    <Route path="products/price-history" element={<PriceHistory />} />
    <Route path="products/formula-calculations" element={<FormulaCalculations />} />
    <Route path="interest-payments/overview" element={<SubModuleOverview />} />
    <Route path="interest-payments/create" element={<CreateInterest />} />
    <Route path="interest-payments/view" element={<ViewInterest />} />
    <Route path="interest-payments/detail" element={<InterestDetail />} />
    <Route path="company-invoices/overview" element={<SubModuleOverview />} />
    <Route path="estimations/overview" element={<SubModuleOverview />} />
    <Route path="estimations/commission" element={<CommissionEstimations />} />
    <Route path="estimations/view" element={<ViewEstimations />} />
    <Route path="estimations/detail" element={<EstimationDetail />} />
    <Route path="masters/overview" element={<SubModuleOverview />} />
    <Route path="masters/banners" element={<Banners />} />
    <Route path="masters/subscriptions" element={<Subscriptions />} />
    <Route path="masters/product-enquiry" element={<ProductEnquiries />} />
    <Route path="masters/contact-enquiry" element={<Contactenquiry />} />
    <Route path="masters/testimonials" element={<Testimonials />} />
    <Route path="masters/blogs" element={<Blogs />} />
    <Route path="masters/users" element={<Users />} />
    <Route path="masters/registration-details" element={<RegistrationDetails />} />
    <Route path="company-invoices/generate" element={<GenerateInvoice />} />
    <Route path="company-invoices/view" element={<ViewInvoices />} />
    <Route path="truck-management/pending-contracts" element={<PendingContracts />} />
    <Route path="truck-management/pending-delivery-orders" element={<PendingDeliveryOrders />} />
    <Route path="truck-management/add-dispatch-by-user" element={<Sellerdispatch />} />
    <Route path="truck-management/seller-dispatches-new" element={<SellerDispatches />} />
    <Route path="truck-management/seller-dispatches-new/update/:contractNo" element={<UpdateSellerDispatch />} />
    <Route path="truck-management/pending-delivery-orders/seller-truck-review/:id" element={<SellerTruckReview />} />
    <Route path="truck-management/open-pending-contracts" element={<OpenPendingContracts />} />
    <Route path="truck-management/open-pending-contracts/instant-truck" element={<AddInstantTruck />} />
    <Route path="truck-management/open-pending-contracts/schedule-dispatch" element={<ScheduleDispatch />} />
    <Route path="truck-management/open-pending-contracts/view-trucks" element={<ViewTrucksByContract />} />
    <Route path="truck-management/open-pending-contracts/reassign-truck" element={<ReassignTruck />} />
    <Route path="truck-management/open-pending-contracts/truck-chain" element={<ContractTruckChain />} />
    <Route path="truck-management/open-pending-contracts/manage-schedule" element={<ManageSchedule />} />
    <Route path="truck-management/open-pending-contracts/add-truck-to-schedule" element={<AddTruckToSchedule />} />
    <Route path="truck-management/open-pending-contracts/update-truck-status" element={<UpdateTruckStatus />} />
    <Route path="truck-management/assign-transports" element={<Assigntransports />} />
    <Route path="truck-management/transporters/driver-master" element={<DriversList />} />
    <Route path="truck-management/transporters/driver-master/new" element={<DriverNew />} />
    <Route path="truck-management/transporters/driver-master/:id" element={<DriverView />} />
    <Route path="truck-management/transporters/truck-master" element={<TrucksList />} />
    <Route path="truck-management/transporters/truck-master/new" element={<TruckNew />} />
    <Route path="truck-management/transporters/truck-master/:id" element={<TrucksView />} />
    <Route path="truck-management/transporters/driver-truck-mapping" element={<DriverTruckMapping />} />
    <Route path="truck-management/transporters/truck-trips" element={<TruckTrips />} />
    <Route path="truck-management/transporters/truck-trips/new" element={<TruckTripNew />} />
    <Route path="truck-management/transporters/truck-trips/:id" element={<TruckTripView />} />
    <Route path="truck-management/pending-dos" element={<PendingDeliveryOrders />} />
    <Route path="truck-management/seller-truck-review" element={<SellerTruckReview />} />
    <Route path="truck-management/transporters/dashboard" element={<TransporterDashboard />} />
    <Route path="truck-management/transporters/transport-dashboard" element={<TransporterDashboard />} />
    <Route path="reports/seller-invoice-reports" element={<SellerInvoiceReports />} />
    <Route path="reports/seller-buyer-accounts" element={<SellerBuyerAccounts />} />
    <Route path="reports/contract-wise-status" element={<ContractWiseStatus />} />
    <Route path="reports/contract-summary" element={<ContractSummary />} />
    <Route path="reports/account-statement" element={<AccountStatement />} />
    <Route path="reports/pending-payments" element={<PendingPayments />} />
    <Route path="reports/pending-supplies" element={<PendingSupplies />} />
    <Route path="reports/monthly-reports" element={<MonthlyReports />} />
    <Route path="payments/seller-invoice" element={<Sellerinvoice />} />
    <Route path="payments/seller-invoice-edit" element={<EditSellerInvoices />} />
    <Route path="payments/payment-advice" element={<Paymentadvice />} />
    <Route path="payments/payment-allocation" element={<PaymentAllocation />} />
    <Route path="payments/refunds" element={<Refunds />} />
    <Route path="*" element={<AdminNotFound />} />
  </>
);
