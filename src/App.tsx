import './assets/styles/App.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Contracts from './pages/contracts/Contracts'
import ContractDetail from './pages/contracts/ContractDetail'
import NewContract from './pages/contracts/NewContract'

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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
