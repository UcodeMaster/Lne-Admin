import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  Layers,
  MapPin,
  FormInput,
  FileText,
  Shield,
  User,
  Calendar,
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    padding: '0.9rem 1.5rem',
    color: active ? '#fff' : 'rgba(255,255,255,0.8)',
    backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    borderRadius: '10px',
    fontWeight: active ? '600' : '500',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <Icon size={20} style={{ marginRight: '1rem' }} />
    <span>{label}</span>
    {active && (
      <div style={{
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        width: '3px',
        backgroundColor: '#fff'
      }} />
    )}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isBM = user?.role === 'branch_manager';

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(180deg, #f7f7f7 0%, #f0f9ff 100%)' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: 'linear-gradient(180deg, rgba(0, 168, 89, 0.95) 0%, rgba(0, 122, 63, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
        color: 'white',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>
            {isBM ? 'LNE Branch' : 'LNE Admin'}
          </h1>
          {isBM && user?.branch_city && (
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} /> {user.branch_city}, {user.state}
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {!isBM ? (
            /* ── Admin Navigation ── */
            <>
              <SidebarItem icon={LayoutDashboard} label="Overview"               to="/"                        active={isActive('/')} />
              <SidebarItem icon={ShoppingBag}     label="Marketplace"            to="/marketplace"             active={isActive('/marketplace')} />
              <SidebarItem icon={Layers}          label="Marketplace Categories" to="/marketplace/categories"  active={isActive('/marketplace/categories')} />
              <SidebarItem icon={Package}         label="Solar Packages"         to="/products"                active={isActive('/products')} />
              <SidebarItem icon={CreditCard}      label="BNPL Applications"      to="/bnpl"                    active={isActive('/bnpl')} />
              <SidebarItem icon={Calendar}        label="Payment Schedules"      to="/payment-schedules"       active={isActive('/payment-schedules')} />
              <SidebarItem icon={ShoppingCart}    label="Orders & Sales"         to="/orders"                  active={isActive('/orders')} />
              <SidebarItem icon={Users}           label="Customers"              to="/users"                   active={isActive('/users')} />
              <SidebarItem icon={FormInput}      label="Settings"              to="/settings"              active={isActive('/settings')} />
              <SidebarItem icon={Shield}         label="Admin Management"      to="/admins"                active={isActive('/admins')} />

              {/* Branch Manager Section */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600', color: 'rgba(255,255,255,0.5)', paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
                  Branch Managers
                </div>
                <SidebarItem icon={MapPin}    label="Branch Managers"  to="/branch-managers"     active={isActive('/branch-managers')} />
              </div>
            </>
          ) : (
            /* ── Branch Manager Navigation ── */
            <>
              <SidebarItem icon={LayoutDashboard} label="Dashboard"          to="/branch-manager/dashboard"           active={isActive('/branch-manager/dashboard')} />
              <SidebarItem icon={Users}           label="Customers"          to="/branch-manager/customers"           active={isActive('/branch-manager/customers')} />
              <SidebarItem icon={CreditCard}      label="BNPL Applications"  to="/branch-manager/bnpl"                active={isActive('/branch-manager/bnpl')} />
              <SidebarItem icon={ShoppingCart}    label="Orders & Sales"     to="/branch-manager/orders"              active={isActive('/branch-manager/orders')} />
              <SidebarItem icon={FormInput}       label="Eligibility Survey" to="/branch-manager/eligibility-survey"  active={isActive('/branch-manager/eligibility-survey')} />
            </>
          )}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '1.5rem' }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              marginRight: '1rem', fontWeight: 'bold', backdropFilter: 'blur(5px)'
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', letterSpacing: '0.3px', color: '#fff' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
                {isBM ? 'Branch Manager' : 'Administrator'}
              </div>
            </div>
          </Link>
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', padding: '0.6rem 1.5rem',
            color: isActive('/profile') ? '#fff' : 'rgba(255,255,255,0.7)',
            backgroundColor: isActive('/profile') ? 'rgba(255,255,255,0.15)' : 'transparent',
            textDecoration: 'none', borderRadius: '10px', fontWeight: '500',
            fontSize: '0.9rem', marginBottom: '0.5rem', transition: 'all 0.3s ease',
          }}>
            <User size={18} style={{ marginRight: '0.75rem' }} />
            <span>My Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)';
              e.currentTarget.style.color = '#FFA1A1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              padding: '0.8rem 1.5rem', color: 'rgba(255, 255, 255, 0.85)',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: '10px', textAlign: 'left', transition: 'all 0.3s ease', marginTop: '0.5rem'
            }}
          >
            <LogOut size={20} style={{ marginRight: '1rem' }} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#fff' }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
