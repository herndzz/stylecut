import React from "react";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'clients', label: 'Clientes' },
    { id: 'professionals', label: 'Profissionais' },
    { id: 'services', label: 'Serviços' },
    { id: 'appointments', label: 'Agendamentos' },
  ];

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">StyleCut</h1>
          <nav>
            <ul className="flex space-x-6">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-2 rounded transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
