import React, { useState } from "react";
import Header from "./components/Header";
// Corrigindo as importações para usar as extensões corretas
import Clients from "./pages/Clients";
import Professionals from "./pages/Professionals";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("clients");

  const renderPage = () => {
    switch (currentPage) {
      case "clients":
        return <Clients />;
      case "professionals":
        return <Professionals />;
      case "services":
        return <Services />;
      case "appointments":
        return <Appointments />;
      default:
        return <Clients />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">{renderPage()}</main>
    </div>
  );
};

export default App;