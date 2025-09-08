import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Services from '../Services';

function wrapper(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('Services page', () => {
  test('renders and creates service', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.spyOn(global, 'fetch');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 's1', name: 'Corte', duration_minutes: 30, price_cents: 5000 }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ id: 's1', name: 'Corte', duration_minutes: 30, price_cents: 5000 }]), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    render(wrapper(<Services />));

    const name = await screen.findByLabelText(/nome/i);
    await user.clear(name as HTMLInputElement);
    await user.type(name as HTMLInputElement, 'Corte');

    const submit = screen.getByRole('button', { name: /adicionar/i });
    await user.click(submit);

    expect(fetchMock).toHaveBeenCalled();
  });
});
