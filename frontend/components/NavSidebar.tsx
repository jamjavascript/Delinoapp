'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', badge: 'Home' },
  { href: '/analytics', label: 'Analytics', badge: 'Insights' },
  { href: '/alerts', label: 'Price Alerts', badge: 'Alerts' },
  { href: '/favorites', label: 'Favorites', badge: 'Saved' },
  { href: '/admin', label: 'Admin', badge: 'Manage' },
];

export default function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r bg-white">
      <div className="flex flex-col w-full p-6 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Navigation
          </p>
          <nav className="space-y-1 text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">Need data?</p>
          <p>
            Use the refresh action on the dashboard to sync the latest products.
          </p>
        </div>
      </div>
    </aside>
  );
}
