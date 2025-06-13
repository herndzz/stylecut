import CadastroCliente from "./pages/CadastroCliente";
import Agendamentos from "./pages/Agendamentos";

function App() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header>
        <h1 className="text-2xl font-bold mb-6" tabIndex={0} aria-label="StyleCut">
          StyleCut
        </h1>
      </header>
      <section aria-labelledby="cadastro-cliente">
        <CadastroCliente />
        < Agendamentos />
      </section>
    </main>
  );
}

export default App;