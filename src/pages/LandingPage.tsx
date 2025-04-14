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
              Your Life as a Living Timeline
            </p>
          </div>
          
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10 text-muted-foreground animate-fade-in">
            Instead of random posts, build a scrollable, interactive timeline of your life. It's not just social media; it's your legacy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Start Your Timeline
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline" className="border-primary hover:bg-secondary">
                Sign In
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
            <span className="text-primary">Revolutionary</span> Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-primary" />}
              title="Life Timeline"
              description="Create a visual, scrollable timeline from birth to now. Post memories, feelings, milestones, and more."
            />
            <FeatureCard
              icon={<Heart className="h-10 w-10 text-primary" />}
              title="Emotional Tags"
              description="Tag your posts with emotions like joy, heartbreak, or growth. Navigate your life emotionally, not just chronologically."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-primary" />}
              title="Time Capsule Posts"
              description="Schedule memories to unlock for others or yourself in the future."
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-primary" />}
              title="Connection Threads"
              description="Link your memories with friends and family to create shared storylines across multiple timelines."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-primary" />}
              title="Legacy Mode"
              description="Pass down your timeline to loved ones, creating a digital memorial of your life."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-primary" />}
              title="Location Memories"
              description="Pin your memories to specific places and revisit them on a map of your life journey."
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
              title="Meaningful"
              description="Focused on meaning, not clout or temporary trends."
            />
            <ReasonCard
              number="02"
              title="Emotional"
              description="Every profile is an emotional journey, not just pictures."
            />
            <ReasonCard
              number="03"
              title="Legacy"
              description="Designed to be a legacy of your existence that lasts."
            />
          </div>
          
          <div className="mt-16 animate-on-scroll opacity-0">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Create Your Timeline Now
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
