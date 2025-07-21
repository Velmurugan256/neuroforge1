import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import DashboardPage from "./pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import { Toaster } from "@/components/ui/sonner"

// This layout component provides the AuthContext to all routes
// and renders the matched child route via the <Outlet /> component.
const AuthLayout = () => (
  <AuthProvider>
    <Outlet />
    <Toaster />
  </AuthProvider>
)

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
