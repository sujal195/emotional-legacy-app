
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary py-10 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-foreground font-bold text-xl">
                <span className="text-primary">M</span>EMORIA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your life as a living timeline. Build your legacy, one memory at a time.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/timeline" className="text-muted-foreground hover:text-primary text-sm">
                  Timeline
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-foreground mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signin" className="text-muted-foreground hover:text-primary text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-muted-foreground hover:text-primary text-sm">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-foreground mb-4">Connect</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Follow my journey and share yours.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61563769991865" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-muted pt-8 mt-8 text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center">
            Made with <Heart size={16} className="mx-1 text-red-500" /> by MEMORIA
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            © {new Date().getFullYear()} MEMORIA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
