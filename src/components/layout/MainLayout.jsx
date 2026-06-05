import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import Footer from './Footer';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex fixed inset-y-0 z-30" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ltr:pl-64 md:rtl:pr-64 min-w-0 pt-16 transition-all duration-300">

        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
