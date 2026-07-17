import './assets/styles/App.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Contracts from './pages/contracts/Contracts'
import ContractDetail from './pages/contracts/ContractDetail'
import NewContract from './pages/contracts/NewContract'
import Businessowners from './pages/usermanagement/businessowners/Businessowners'
import BusinessOwnerDetail from './pages/usermanagement/businessowners/BusinessOwnerDetail'
import Newbusiness from './pages/usermanagement/businessowners/Newbusiness'

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
          <Route path="/business-owners/edit/:id" element={<Newbusiness />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
