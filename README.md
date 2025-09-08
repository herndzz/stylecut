# StyleCut Mobile (React Native + TypeScript)

App móvel com React Navigation, React Query, Axios, NativeWind (Tailwind RN), ESLint e .env.

Pastas principais
- screens/
- components/
- hooks/
- services/
- utils/
- assets/

Configuração de ambiente (.env)
- Crie .env na raiz com:
```
API_URL=http://localhost:3000/api
```
- Em dispositivos físicos, use o IP da sua máquina (ex.: http://192.168.0.10:3000/api). No Android emulador, pode usar http://10.0.2.2:3000/api.

Navegação
- React Navigation (Stack) já configurado em App.tsx com telas: Home, Clients, Professionals, Services, Appointments.

Estado/Cache
- React Query configurado em src/services/queryClient.ts com defaults para RN (staleTime, retry, focus handling via AppState).
- Hooks de dados: useClients, useProfessionals, useServices, useAppointments (GET + mutações CRUD).

Instalação
1) Node.js 18+, JDK 17+, Android Studio/SDK e Xcode (macOS p/ iOS).
2) Instale dependências: `npm install`
3) iOS (macOS): `cd ios && pod install && cd ..`

Execução
- Metro: `npm start`
- Android (emulador): `npm run android`
- iOS (simulador, macOS): `npm run ios`

Dispositivo físico
- Android: conecte via USB e rode `npm run android`. Se a API estiver no host, use `adb reverse tcp:3000 tcp:3000` ou configure API_URL com o IP do host.
- iOS: use o IP do host em API_URL e esteja na mesma rede.

Testando funcionalidades (MVP)
1) Clientes
   - Abrir “Clientes” → “Novo Cliente” → preencher nome/telefone → salvar.
   - Editar/Excluir via ações do item.
2) Profissionais
   - Abrir “Profissionais” → criar/editar/excluir similar a clientes.
3) Serviços
   - Abrir “Serviços” → criar com name/price/duration → editar/excluir.
4) Agendamentos
   - Abrir “Agendamentos” → “Novo Agendamento” → selecionar cliente, profissional, serviço e informar data (YYYY-MM-DD) e hora (HH:mm).
   - Completar/Cancelar agendamentos; tentar criar conflito (mesmo profissional e mesma hora) deve falhar com mensagem do backend.

Notas
- Axios usa API_URL do .env (via @env). Ajuste conforme o backend.
- Tailwind (NativeWind) habilita className nos componentes.
- Feedback visual: loading (ActivityIndicator/Loading), erro/sucesso via Alert.

Scripts úteis
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
