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
import Newbusiness from './pages/usermanagement/businessowners/BusinessNew/Newbusiness'
import Transprters from './pages/usermanagement/transporters/transportersList/Transprters'
import Newtransporter from './pages/usermanagement/transporters/transportersNew/Newtransporter'
import Transportview from './pages/usermanagement/transporters/transportView/Transportview'
import Promoterlist from './pages/usermanagement/promoters/promoterslist/Promoterlist'
import Promoternew from './pages/usermanagement/promoters/promoternew/Promoternew'
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
import PriceHistory from './pages/product-management/price-history/ProductPrieHistory'
import FormulaCalculations from './pages/product-management/formula-calculations/FormulaCalculations'
import PendingContracts from './pages/truck-management/pending-contracts/PendingContracts'
import BulkFreightApproval from './pages/truck-management/bulk-freight-approval/BulkFreightApproval'

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
          <Route path="/business-owners/new" element={<Newbusiness />} />
          <Route path="/transporters" element={<Transprters />} />
          <Route path="/transporters/new" element={<Newtransporter />} />
          <Route path="/transporters/:id" element={<Transportview />} />
          <Route path="/promoters" element={<Promoterlist />} />
          <Route path="/promoters/new" element={<Promoternew />} />
          <Route path="/promoters/:id" element={<Promoterview />} />
          <Route path="/business-owners/edit/:id" element={<Newbusiness />} />
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
