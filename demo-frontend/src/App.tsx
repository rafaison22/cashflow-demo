import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout           from './components/Layout';
import { isLoggedIn }   from './lib/auth';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import Movimientos      from './pages/Movimientos';
import Cajas            from './pages/Cajas';
import Proveedores      from './pages/Proveedores';
import Usuarios         from './pages/Usuarios';
import MiCuentaPersonal from './pages/MiCuentaPersonal';
import Subempresas      from './pages/Subempresas';
import Auditoria        from './pages/Auditoria';
import Claves           from './pages/Claves';
import { NotifProvider } from './context/NotifContext';

const queryClient = new QueryClient();

function ProtectedLayout() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Layout />;
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path:    '/',
    element: <ProtectedLayout />,
    children: [
      { index: true,         element: <Dashboard /> },
      { path: 'movimientos', element: <Movimientos /> },
      { path: 'cajas',       element: <Cajas /> },
      { path: 'proveedores', element: <Proveedores /> },
      { path: 'mi-cuenta',   element: <MiCuentaPersonal /> },
      { path: 'usuarios',    element: <Usuarios /> },
      { path: 'subempresas', element: <Subempresas /> },
      { path: 'auditoria',   element: <Auditoria /> },
      { path: 'claves',      element: <Claves /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotifProvider>
        <RouterProvider router={router} />
      </NotifProvider>
    </QueryClientProvider>
  );
}
