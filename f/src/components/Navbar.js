import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuthData, clearAuthData, isAdmin } from '../utils/auth';
import { Button } from './ui/button';
import { LogOut, User, LayoutDashboard, FileText, Package, Wallet, ShieldCheck, UserCog } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = getAuthData();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary text-primary-foreground border-b-2 border-border shadow-md" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-shrink-0" data-testid="nav-logo">
            <Package className="h-6 w-6 text-accent" />
            <span className="font-manrope font-bold text-xl hidden sm:inline">TenderFlow</span>
          </Link>

          <div className="flex items-center space-x-1 flex-1 justify-center sm:justify-start sm:ml-8">
            {user ? (
              <>
                {isAdmin() ? (
                  <>
                    <Link to="/admin/dashboard" data-testid="nav-admin-dashboard">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative group ${isActive('/admin/dashboard') ? 'text-white' : ''
                          }`}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                        {isActive('/admin/dashboard') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/admin/tenders" data-testid="nav-admin-tenders">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/admin/tenders') ? 'text-white' : ''
                          }`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Tenders
                        {isActive('/admin/tenders') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/admin/orders" data-testid="nav-admin-orders">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/admin/orders') ? 'text-white' : ''
                          }`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                        {isActive('/admin/orders') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/admin/approvals" data-testid="nav-admin-approvals">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/admin/approvals') ? 'text-white' : ''
                          }`}
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Approvals
                        {isActive('/admin/approvals') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/admin/users" data-testid="nav-admin-users">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/admin/users') ? 'text-white' : ''
                          }`}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Directory
                        {isActive('/admin/users') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/marketplace" data-testid="nav-marketplace">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/marketplace') ? 'text-white' : ''
                          }`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Marketplace
                        {isActive('/marketplace') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/orders" data-testid="nav-my-orders">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/orders') ? 'text-white' : ''
                          }`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        My Orders
                        {isActive('/orders') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                    <Link to="/wallet" data-testid="nav-wallet">
                      <Button
                        variant="ghost"
                        className={`text-white/90 hover:text-white hover:bg-white/10 relative ${isActive('/wallet') ? 'text-white' : ''
                          }`}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Wallet
                        {isActive('/wallet') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                        )}
                      </Button>
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile" data-testid="nav-profile">
                  <Button
                    variant="ghost"
                    className={`text-white/90 hover:text-white hover:bg-white/10 relative hidden sm:flex ${isActive('/profile') ? 'text-white' : ''
                      }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                    {isActive('/profile') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></div>
                    )}
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white/90 hover:text-white hover:bg-red-500/10 hover:text-red-400 ml-2 border border-white/10 hover:border-red-500/30"
                  data-testid="nav-logout"
                >
                  <LogOut className="h-4 w-4 mr-2 hidden sm:inline" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login">
                  <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register" data-testid="nav-register">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
