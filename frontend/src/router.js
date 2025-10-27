import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BrowseCampaigns from './pages/BrowseCampaigns';
import CampaignDetail from './components/campaigns/CampaignDetail';
import CreateCampaign from './components/campaigns/CreateCampaign';
import EditCampaign from './components/campaigns/EditCampaign';
import UserDashboard from './components/dashboard/UserDashboard';
import CreatorDashboard from './components/dashboard/CreatorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';

// Future flags configuration
export const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Define routes
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/campaigns", element: <BrowseCampaigns /> },
      { path: "/campaigns/:id", element: <CampaignDetail /> },
      { 
        path: "/create-campaign", 
        element: <PrivateRoute requiredRole="creator"><CreateCampaign /></PrivateRoute> 
      },
      { 
        path: "/campaigns/:id/edit", 
        element: <PrivateRoute requiredRole="creator"><EditCampaign /></PrivateRoute> 
      },
      { 
        path: "/dashboard", 
        element: <PrivateRoute><UserDashboard /></PrivateRoute> 
      },
      { 
        path: "/creator-dashboard", 
        element: <PrivateRoute requiredRole="creator"><CreatorDashboard /></PrivateRoute> 
      },
      { 
        path: "/admin", 
        element: <PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute> 
      },
      { 
        path: "/profile", 
        element: <PrivateRoute><Profile /></PrivateRoute> 
      },
      { 
        path: "/admin-panel", 
        element: <PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute> 
      }
    ]
  }
];

// Export router configuration
export const router = createBrowserRouter(routes, routerOptions);