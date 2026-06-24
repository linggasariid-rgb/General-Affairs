import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function DashboardLayout() {
  const [show, setShow] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar show={show} onClose={() => setShow(false)} />
      {show && <div className="sidebar-backdrop d-lg-none" onClick={() => setShow(false)} />}
      <div className="d-flex flex-column flex-grow-1 min-width-0">
        <Navbar onToggle={() => setShow(!show)} />
        <main className="flex-grow-1 p-3 p-lg-4 bg-light overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
