import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { notificationApi, type BackendNotification } from '@/services/api';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  LogOut,
  ChevronRight,
  Bell,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BackButton from './BackButton';

interface LayoutProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const location = useLocation();

  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const role = user?.role || 'Doctor';
        const data = await notificationApi.list(role);
        setNotifications(data);

        // Calculate unread count and play sound if it increased
        const unreadCount = data.filter((n: BackendNotification) => !n.is_read).length;
        if (unreadCount > previousUnreadCount.current) {
          // Note: create a simple notification sound in public folder or fallback to a standard base64 sound if not available.
          // Using a common approach: an inline data URI for a short ping to guarantee it works.
          const pingSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(100).join('U'));
          pingSound.volume = 0.5;
          pingSound.play().catch(e => console.log('Audio play failed (maybe user has not interacted with UI yet):', e));
        }
        previousUnreadCount.current = unreadCount;

      } catch (e) {
        console.error("Erreur de chargement des notifications", e);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: BackendNotification) => {
    if (!notif.is_read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const doctorMenu = [
    { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/rendez-vous', label: 'Rendez-vous', icon: Calendar },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/documents', label: 'Documents', icon: FileText },
  ];

  // Interfaces vraiment différentes selon le rôle
  const menuItemsToRender =
    !user || user.role === 'Doctor' || user.role === 'Admin'
      ? doctorMenu
      : user.role === 'Receptionist'
        ? [
          { path: '/secretariat', label: 'Espace Secrétariat', icon: Calendar },
          { path: '/rendez-vous', label: 'Rendez-vous', icon: Calendar },
          { path: '/patients', label: 'Patients', icon: Users },
        ]
        : [
          // Patient
          { path: '/espace-patient', label: 'Espace Patient', icon: User },
          { path: '/documents', label: 'Mes documents', icon: FileText },
        ];

  const getPageTitle = () => {
    const item = menuItemsToRender.find(item => item.path === location.pathname);
    return item?.label || 'Tableau de bord';
  };

  const getBreadcrumbIcon = () => {
    const item = menuItemsToRender.find(item => item.path === location.pathname);
    if (item) {
      const Icon = item.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#f0f4f4]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0d3d3d] text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c4a35a] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cabinet Dentaire</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 p-3 bg-[#1a4d4d] rounded-xl">
            <Avatar className="w-10 h-10 bg-[#c4a35a]">
              <AvatarFallback className="bg-[#c4a35a] text-white text-sm font-medium">
                {user?.name.split(' ').map(n => n[0]).join('') || 'YB'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user?.name || 'Dr. Youssef Benali'}</p>
              <span className="text-xs text-[#c4a35a] bg-[#0d3d3d] px-2 py-0.5 rounded-full">
                {user?.role || 'Doctor'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menuItemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-[#1a7a7a] text-white shadow-md'
                    : 'text-gray-300 hover:bg-[#1a4d4d] hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1a4d4d]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a4d4d] rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Cabinet</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-[#0d3d3d] flex items-center gap-2">
                {getBreadcrumbIcon()}
                {getPageTitle()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-[#0d3d3d] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-[#0d3d3d]">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-[#c4a35a] text-white px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-[#f0f4f4]/50' : 'opacity-70'}`}
                          >
                            <p className={`text-sm ${!notif.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        Aucune notification
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Avatar className="w-9 h-9 bg-[#0d3d3d]">
              <AvatarFallback className="bg-[#0d3d3d] text-white text-xs font-medium">
                {user?.name.split(' ').map(n => n[0]).join('') || 'YB'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
