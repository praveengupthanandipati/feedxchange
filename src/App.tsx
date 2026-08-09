import './assets/styles/App.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import ContractchangeStatus from './pages/contracts/contract-status/contractChangeStatus'
import PromoterDashboard from './pages/usermanagement/promoters/promoterdashboard/PromoterDashboard'
import Promocodes from './pages/usermanagement/promoters/promocodes/Promocodes'
import ReferredProfiles from './pages/usermanagement/promoters/referredprofiles/ReferredProfiles'
import ProductPriceTracking from './pages/product-management/price-tracking/ProductPriceTracking'
import PriceHistory from './pages/product-management/price-history/ProductPrieHistory'
import FormulaCalculations from './pages/product-management/formula-calculations/FormulaCalculations'
import PendingContracts from './pages/truck-management/pending-contracts/PendingContracts'
import BulkFreightApproval from './pages/truck-management/bulk-freight-approval/BulkFreightApproval'
import Assigntransports from './pages/truck-management/assign-transports/Assigntransports'

function App() {
  return (
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
          <Route path="/truck-management/pending-contracts" element={<PendingContracts />} />
          <Route path="/truck-management/bulk-freight-approval" element={<BulkFreightApproval />} />
          <Route path="/truck-management/assign-transports" element={<Assigntransports />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
