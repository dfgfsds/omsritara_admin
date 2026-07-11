import { Outlet } from 'react-router-dom';
import StoreNav from '../../components/store/StoreNav';

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 min-w-[16rem] max-w-[16rem] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <StoreNav />
      </aside>
      <main className="flex-1 p-4 bg-white">
        <Outlet />
      </main>
    </div>
  );
}