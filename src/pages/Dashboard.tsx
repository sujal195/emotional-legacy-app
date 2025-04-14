
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Clock, Heart, Map, Settings, File, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data - will be replaced with actual data from the backend
  const recentMemories = [
    { id: 1, title: 'First day at college', date: '2020-09-01', emotion: 'Excited' },
    { id: 2, title: 'Family trip to Paris', date: '2021-07-15', emotion: 'Joy' },
    { id: 3, title: 'Got my dream job', date: '2023-03-10', emotion: 'Proud' },
  ];
  
  const stats = [
    { title: 'Memories', value: '42', icon: <File className="h-4 w-4" /> },
    { title: 'Timeline Years', value: '8', icon: <Calendar className="h-4 w-4" /> },
    { title: 'Emotional Tags', value: '15', icon: <Heart className="h-4 w-4" /> },
    { title: 'Locations', value: '23', icon: <Map className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your MEMORIA overview.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Memory
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-secondary/50">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Memories */}
          <div className="lg:col-span-2">
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle>Recent Memories</CardTitle>
                <CardDescription>Your latest entries on your timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMemories.map((memory) => (
                    <div 
                      key={memory.id}
                      className="p-4 rounded-lg border border-muted flex justify-between items-center hover:border-primary transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium">{memory.title}</p>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {memory.date}
                          <span className="mx-2">•</span>
                          <Heart className="mr-1 h-3 w-3 text-primary" />
                          {memory.emotion}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/timeline">
                    <Button variant="outline">
                      View All Memories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Tools to manage your timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Memory
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Clock className="mr-2 h-4 w-4" />
                    Create Time Capsule
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect with Friends
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Analytics */}
            <Card className="bg-secondary/50 mt-6">
              <CardHeader>
                <CardTitle>Timeline Analytics</CardTitle>
                <CardDescription>Insights from your memories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Top Emotions</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-2/3"></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Joy (67%)</span>
                      <span>Others (33%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Memories Per Year</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-4/5"></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>2023 (80%)</span>
                      <span>Others (20%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
