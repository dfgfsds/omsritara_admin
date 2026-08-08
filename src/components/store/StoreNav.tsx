import { NavLink, useParams } from 'react-router-dom';
import { Settings, Package, ShoppingCart, Users, User, FolderTree, Megaphone, BarChart, Image, Ticket, Library, Star, Headset, Bell } from 'lucide-react';

export default function StoreNav() {
  const { id } = useParams<{ id: string }>();
  
  const links = [
    { to: `/store/${id}/products`, icon: Package, label: 'Products' },
    { to: `/store/${id}/categories`, icon: FolderTree, label: 'Categories' },
    { to: `/store/${id}/orders`, icon: ShoppingCart, label: 'Orders' },
    // { to: `/store/${id}/users`, icon: Users, label: 'Staff' },
    { to: `/store/${id}/website-users`, icon: User, label: 'Customers' },
    { to: `/store/${id}/notification`, icon: Bell, label: 'Notification' },
    // { to: `/store/${id}/marketing`, icon: Megaphone, label: 'Marketing' },
    // { to: `/store/${id}/analytics`, icon: BarChart, label: 'Analytics' },
    { to: `/store/${id}/settings`, icon: Settings, label: 'Settings' },
    { to: `/store/${id}/courseLead`, icon: Headset, label: 'Course Lead' },
    { to: `/store/${id}/gemzLead`, icon: Headset, label: 'Gemz Lead' },
    { to: `/store/${id}/banner`, icon: Image, label: 'Banner' },
    { to: `/store/${id}/coupons`, icon: Ticket, label: 'Coupons' },
    { to: `/store/${id}/blogs`, icon: Library, label: 'Blogs' },
    { to: `/store/${id}/reviews`, icon: Star, label: 'Reviews' },
  ];

  return (
    <nav className="h-full bg-white border-r border-gray-200">
      <div className="h-full px-4 py-6">
        <div className="space-y-3">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center w-full gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#FEE2E2] text-[#A12B1A]' 
                    : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}