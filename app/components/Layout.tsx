'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DatabaseStatus from './DatabaseStatus';
import ViewDatabase from './ViewDatabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/customers', label: 'Customer App' },
    { href: '/install', label: 'Installation' }
  ];

  return (
    <div className="grid grid-rows-[60px_1fr_60px] min-h-screen bg-[#008080]">
      {/* Header */}
      <header className="bg-[#c0c0c0] border-b-2 border-[#000000] p-4">
        <div className="flex justify-between items-center">
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`hover:underline hover:underline-offset-4 ${
                  pathname === item.href ? 'font-semibold text-purple-600' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <DatabaseStatus />
            <ViewDatabase />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8 flex justify-center items-start">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#c0c0c0] border-t-2 border-[#000000] p-4 flex justify-center items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Customer Timer App
        </p>
      </footer>
    </div>
  );
} 