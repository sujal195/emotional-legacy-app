
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Heart, MapPin, MessageCircle, Image, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Mock data - will be replaced with actual data from the backend
const timelineData = [
  {
    year: 2023,
    memories: [
      {
        id: 1,
        title: "Landed my dream job",
        date: "2023-03-10",
        content: "After months of interviews and preparation, I finally got the offer for my dream position at a tech company. The hard work paid off!",
        emotion: "Proud",
        location: "San Francisco, CA",
        hasImage: true,
        comments: 3,
      },
      {
        id: 2,
        title: "Moved to a new apartment",
        date: "2023-01-15",
        content: "Found a beautiful place with an amazing view of the city. The moving process was exhausting but worth it.",
        emotion: "Excited",
        location: "Downtown, San Francisco",
        hasImage: true,
        comments: 5,
      },
    ],
  },
  {
    year: 2022,
    memories: [
      {
        id: 3,
        title: "Graduated from university",
        date: "2022-05-20",
        content: "Four years of hard work finally paid off. So proud of this accomplishment and excited for what's next!",
        emotion: "Happy",
        location: "University Campus",
        hasImage: true,
        comments: 12,
      },
      {
        id: 4,
        title: "Summer road trip with friends",
        date: "2022-07-10",
        content: "We drove down the coast, stopping at every beach along the way. One of the best weeks of my life.",
        emotion: "Joy",
        location: "Pacific Coast Highway",
        hasImage: false,
        comments: 8,
      },
    ],
  },
  {
    year: 2020,
    memories: [
      {
        id: 5,
        title: "Started college",
        date: "2020-09-01",
        content: "My first day of college! Met my roommate who would become one of my best friends.",
        emotion: "Nervous",
        location: "University Campus",
        hasImage: true,
        comments: 2,
      },
    ],
  },
];

const emotions = [
  "Joy", "Sadness", "Fear", "Disgust", "Anger", 
  "Surprise", "Trust", "Anticipation", "Love", "Pride",
  "Excitement", "Gratitude", "Nostalgia", "Anxious", "Peaceful"
];

const Timeline = () => {
  const [expandedYears, setExpandedYears] = useState<number[]>([2023]);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  
  const toggleYear = (year: number) => {
    if (expandedYears.includes(year)) {
      setExpandedYears(expandedYears.filter(y => y !== year));
    } else {
      setExpandedYears([...expandedYears, year]);
    }
  };
  
  const isYearExpanded = (year: number) => expandedYears.includes(year);

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Timeline</h1>
            <p className="text-muted-foreground">Your life journey, one memory at a time.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Dialog open={isAddingMemory} onOpenChange={setIsAddingMemory}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Memory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Memory</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input id="title" placeholder="Memory title" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input id="date" type="date" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="emotion" className="text-right">
                      Emotion
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an emotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion.toLowerCase()}>
                            {emotion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input id="location" placeholder="Where did this happen?" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write about this memory..."
                      className="col-span-3"
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">
                      Image
                    </Label>
                    <Input id="image" type="file" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMemory(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Memory</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Tabs defaultValue="chronological">
              <TabsList>
                <TabsTrigger value="chronological">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Chronological</span>
                </TabsTrigger>
                <TabsTrigger value="emotional">
                  <Heart className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Emotional</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {timelineData.map((yearData) => (
            <div key={yearData.year} className="relative">
              <div className="sticky top-20 z-10 bg-background pt-2 pb-2">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center p-4 rounded-lg border border-muted"
                  onClick={() => toggleYear(yearData.year)}
                >
                  <span className="text-xl font-bold">{yearData.year}</span>
                  {isYearExpanded(yearData.year) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {isYearExpanded(yearData.year) && (
                <div className="mt-4 space-y-6 pl-4 border-l-2 border-primary/30">
                  {yearData.memories.map((memory) => (
                    <div key={memory.id} className="ml-6 relative">
                      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-primary"></div>
                      <Card className="bg-secondary/50 hover:bg-secondary/70 transition-colors duration-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{memory.title}</CardTitle>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive/80">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1 bg-background/50">
                              <Calendar className="h-3 w-3" />
                              {memory.date}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/30">
                              <Heart className="h-3 w-3" />
                              {memory.emotion}
                            </Badge>
                            {memory.location && (
                              <Badge variant="outline" className="flex items-center gap-1 bg-background/50">
                                <MapPin className="h-3 w-3" />
                                {memory.location}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{memory.content}</p>
                          {memory.hasImage && (
                            <div className="relative h-40 sm:h-56 bg-muted rounded-md overflow-hidden my-3">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {memory.comments} comments
                            </Button>
                            <Link to={`/memory/${memory.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary">
                                View Full Memory
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
