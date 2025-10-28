import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Reusable layout component for authenticated app pages
 * Eliminates code duplication from App.jsx
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Floating gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/4 left-1/4" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 pt-20 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
