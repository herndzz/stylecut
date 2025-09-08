import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Clients from '../Clients';
import type { ReactNode } from 'react';

function wrapper(ui: ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('Clients page', () => {
  test('renders and submits form', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.spyOn(global, 'fetch');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: '1', name: 'Ana' }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ id: '1', name: 'Ana' }]), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    render(wrapper(<Clients />));

    const name = await screen.findByLabelText(/nome/i);
    await user.type(name as HTMLInputElement, 'Ana');

    const submit = screen.getByRole('button', { name: /adicionar/i });
    await user.click(submit);

    expect(fetchMock).toHaveBeenCalled();
  });
});
