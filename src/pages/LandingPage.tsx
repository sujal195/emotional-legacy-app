
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Clock, Heart, Calendar, MapPin, MessageCircle, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-down">
            <span className="text-glow text-primary">MEMORIA</span>
          </h1>
          <div className="overflow-hidden max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-foreground/80 animate-slide-up wavy-text">
              Cherish Every Moment, Tell Your Story
            </p>
          </div>
          
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10 text-muted-foreground animate-fade-in">
            More than just memories - create a beautiful, living timeline of your life journey. Share moments that matter with those who matter most.
          </p>
          
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

      {/* Features Section */}
      <section ref={timelineRef} className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-on-scroll opacity-0">
            <span className="text-primary">Magical</span> Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-primary" />}
              title="Life Timeline"
              description="Create a beautiful, visual journey from your past to present. Capture life's milestones, big and small."
            />
            <FeatureCard
              icon={<Heart className="h-10 w-10 text-primary" />}
              title="Emotional Tags"
              description="Color your memories with emotions. Sort by joy, love, growth or any feeling that matters to you."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-primary" />}
              title="Time Capsule Posts"
              description="Send messages to your future self or loved ones. Create magical moments that unlock at just the right time."
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-primary" />}
              title="Connection Threads"
              description="Link memories with friends and family, weaving beautiful narratives across multiple timelines."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-primary" />}
              title="Legacy Mode"
              description="Create a lasting digital legacy of your journey to share with future generations."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-primary" />}
              title="Location Memories"
              description="Map your journey across places that shaped your story. Revisit special locations anytime."
            />
          </div>
        </div>
      </section>

      {/* Why MEMORIA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 animate-on-scroll opacity-0">
            Why <span className="text-primary">MEMORIA</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ReasonCard
              number="01"
              title="Heartfelt"
              description="Focus on what truly matters - not likes or trends, but the real story of your life."
            />
            <ReasonCard
              number="02"
              title="Soulful"
              description="Every profile is a journey through emotions, not just a collection of photos."
            />
            <ReasonCard
              number="03"
              title="Timeless"
              description="Create something beautiful that lasts beyond the moment - your digital legacy."
            />
          </div>
          
          <div className="mt-16 animate-on-scroll opacity-0">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Start Your Story Today
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-secondary p-6 rounded-lg border border-muted animate-on-scroll opacity-0 hover:border-primary transition-colors duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

interface ReasonCardProps {
  number: string;
  title: string;
  description: string;
}

const ReasonCard = ({ number, title, description }: ReasonCardProps) => (
  <div className="animate-on-scroll opacity-0 p-6">
    <div className="text-4xl font-bold text-primary mb-2">{number}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default LandingPage;
