import '@testing-library/jest-dom';

beforeAll(() => {
  // Mock básico de fetch; cada teste pode sobrescrever conforme necessário
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Retorno padrão vazio/OK para evitar erros; tests específicos substituirão com vi.spyOn(global, 'fetch')
    const ok = new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return ok;
  } as any;
});
