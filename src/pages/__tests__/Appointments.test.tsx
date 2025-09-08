import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Appointments from '../Appointments';

function wrapper(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('Appointments page', () => {
  test('shows conflict error on 409', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.spyOn(global, 'fetch');
    // initial loads for clients/professionals/services
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'c1', name: 'Ana' }]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'p1', name: 'Bob' }]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 's1', name: 'Corte' }]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Conflicting appointment for this professional at the same start_time' }), { status: 409, headers: { 'Content-Type': 'application/json' } }));

    render(wrapper(<Appointments />));

    await user.selectOptions(await screen.findByLabelText(/cliente/i), 'c1');
    await user.selectOptions(await screen.findByLabelText(/profissional/i), 'p1');
    await user.selectOptions(await screen.findByLabelText(/serviço/i), 's1');

    const dt = await screen.findByLabelText(/início/i);
    await user.type(dt as HTMLInputElement, '2030-01-01T12:00');

    await user.click(screen.getByRole('button', { name: /agendar/i }));

    expect(await screen.findByText(/conflicting/i)).toBeInTheDocument();
  });
});
