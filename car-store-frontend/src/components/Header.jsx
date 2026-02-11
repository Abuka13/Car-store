import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Gavel, Heart, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <Car size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
          AutoAuction
        </Link>

        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Car size={18} />
            Cars
          </Link>

          <Link to="/auctions" className={`nav-link ${isActive('/auctions') ? 'active' : ''}`}>
            <Gavel size={18} />
            Auctions
          </Link>

          <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            <Heart size={18} />
            Favorites
          </Link>

          <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            Orders
          </Link>

          {isAdmin() && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              Admin
            </Link>
          )}

          <div className="flex items-center gap-2">
            <span className="nav-link">
              <User size={18} />
              {user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-sm btn-outline">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
