
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items - shown to all users
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Timeline', href: '/timeline' },
  ];
  
  // Navigation items - only shown to authenticated users
  const authNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <nav
      className={cn(
        'fixed w-full z-50 transition-all duration-300',
        scrolled ? 'bg-background/90 backdrop-blur-md py-2 shadow-lg' : 'bg-transparent py-4'
      )}
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-foreground font-bold text-xl md:text-2xl">
              <span className="text-primary">M</span>EMORIA
            </span>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === item.href ? 'text-primary' : 'text-foreground/70'
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {user && authNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === item.href ? 'text-primary' : 'text-foreground/70'
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => navigate('/profile')}
              >
                <User size={16} className="mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" className="flex items-center" onClick={signOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link to="/signin">
                <Button variant="outline" className="border-primary text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary text-foreground hover:bg-primary/80">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:text-primary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === item.href ? 'text-primary' : 'text-foreground/70'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user && authNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === item.href ? 'text-primary' : 'text-foreground/70'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex flex-col space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    navigate('/profile');
                    setIsOpen(false);
                  }}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-4">
                <Link to="/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-primary text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-foreground hover:bg-primary/80">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
