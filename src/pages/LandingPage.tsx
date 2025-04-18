
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Clock, Heart, Calendar, MapPin, MessageCircle, Star, User, Lock, Timer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [availableSeats] = useState(13); // Dynamically calculate this in production
  const [totalSeats] = useState(100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-background to-background -z-10" />
        
        <div className="container mx-auto text-center">
          <div className="mb-6 text-sm font-semibold text-primary flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            INVITE-ONLY ACCESS
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-down">
            <span className="text-glow text-primary">MEMORIA</span>
          </h1>
          
          <div className="overflow-hidden max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/80 animate-slide-up">
              Not everyone gets to save their story here.
              <br />
              <span className="text-primary font-semibold">Got your key?</span>
            </p>
          </div>
          
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Timer className="h-5 w-5 text-primary" />
              <span>The waitlist grows every hour</span>
            </div>
            
            <div className="max-w-lg mx-auto px-4">
              <div className="bg-muted/30 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${((totalSeats - availableSeats) / totalSeats) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Limited seats today: {availableSeats} of {totalSeats} remaining
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Begin Your Journey
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline" className="border-primary hover:bg-secondary">
                Welcome Back
              </Button>
            </Link>
          </div>
        </div>
        
        <button 
          className="absolute bottom-10 animate-bounce text-muted-foreground hover:text-primary transition-colors duration-300"
          onClick={scrollToTimeline}
        >
          <ArrowDown size={32} />
          <span className="sr-only">Scroll down</span>
        </button>
      </section>

      {/* FOMO Sections */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Brutal Truth Card */}
            <div className="bg-background/50 p-8 rounded-lg border border-muted animate-on-scroll opacity-0">
              <AlertCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">You won't remember today perfectly.</h3>
              <p className="text-muted-foreground">Not next month. Not next year. Unless you save it now.</p>
            </div>

            {/* Social Proof Card */}
            <div className="bg-background/50 p-8 rounded-lg border border-muted animate-on-scroll opacity-0">
              <Star className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">10,000+ stories saved</h3>
              <p className="text-muted-foreground">Meanwhile, yours is still slipping away.</p>
            </div>

            {/* Life is Short Card */}
            <div className="bg-background/50 p-8 rounded-lg border border-muted animate-on-scroll opacity-0">
              <Clock className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">30,000 days in your lifetime</h3>
              <p className="text-muted-foreground">How many are you actually saving?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Members Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-on-scroll opacity-0">
            Become a <span className="text-primary">Legend</span>
          </h2>
          
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-xl text-muted-foreground mb-6">
              Founders aren't just users — they are legends.
              Build your timeline today and be remembered forever.
            </p>
            <p className="text-sm text-primary font-semibold">
              This window closes once the first 1000 stories are captured.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-secondary/50 p-8 rounded-lg animate-on-scroll opacity-0">
              <h3 className="text-xl font-bold mb-4">Timeline Regret</h3>
              <p className="text-muted-foreground">
                Imagine opening your MEMORIA 10 years later...
                And it's empty.
                Don't leave your future self with regret.
              </p>
            </div>
            <div className="bg-secondary/50 p-8 rounded-lg animate-on-scroll opacity-0">
              <h3 className="text-xl font-bold mb-4">Your Story Matters</h3>
              <p className="text-muted-foreground">
                Every second you wait is another memory at risk of being lost forever.
                Start preserving your legacy today.
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Claim Your Founder Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Created By Section */}
      <div className="absolute bottom-4 right-4 text-right">
        <div className="flex items-center justify-end space-x-2 text-muted-foreground">
          <User size={16} className="text-primary" />
          <span className="text-sm font-light">
            Created By: <span className="text-primary font-semibold">Sujal Giri</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
