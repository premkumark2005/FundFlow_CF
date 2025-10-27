import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CampaignProvider } from '../../context/CampaignContext';
import Header from '../common/Header';
import Footer from '../common/Footer';

const Layout = () => {
  return (
    <AuthProvider>
      <CampaignProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      </CampaignProvider>
    </AuthProvider>
  );
};

export default Layout;