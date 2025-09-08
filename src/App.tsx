import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Clients from './pages/Clients';
import Professionals from './pages/Professionals';
import Services from './pages/Services';
import Appointments from './pages/Appointments';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">StyleCut</Link>
          <nav className="space-x-4">
            <NavLink to="/clients" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700'}>Clientes</NavLink>
            <NavLink to="/professionals" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700'}>Profissionais</NavLink>
            <NavLink to="/services" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700'}>Serviços</NavLink>
            <NavLink to="/appointments" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700'}>Agendamentos</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/services" element={<Services />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-gray-500 py-4">MVP</footer>
    </div>
  );
}

function Welcome() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Bem-vindo ao StyleCut</h1>
      <p>Use o menu para gerenciar Clientes, Profissionais, Serviços e Agendamentos.</p>
    </div>
  );
}
