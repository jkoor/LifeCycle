"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Check,
  ChevronRight,
  Home,
  Mail,
  Settings,
  User,
  Bell,
  Calendar,
  FileText,
  Heart,
  Search,
  Star,
  Zap,
} from "lucide-react"

export default function DesignPlayground() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Design Playground</h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive showcase of typography, colors, and UI components
          </p>
        </div>

        {/* Typography Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Typography System</h2>
            <p className="text-muted-foreground">Font family: Inter (Sans)</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Headings & Text Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-6xl (60px)</p>
                  <h1 className="text-6xl font-bold">The quick brown fox</h1>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-5xl (48px)</p>
                  <h2 className="text-5xl font-bold">The quick brown fox</h2>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-4xl (36px)</p>
                  <h3 className="text-4xl font-semibold">The quick brown fox</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-3xl (30px)</p>
                  <h4 className="text-3xl font-semibold">The quick brown fox</h4>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-2xl (24px)</p>
                  <h5 className="text-2xl font-medium">The quick brown fox</h5>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-xl (20px)</p>
                  <h6 className="text-xl font-medium">The quick brown fox</h6>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-base (16px)</p>
                  <p className="text-base">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-sm (14px)</p>
                  <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-xs (12px)</p>
                  <p className="text-xs">The quick brown fox jumps over the lazy dog</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Color Palette</h2>
            <p className="text-muted-foreground">Tailwind v4 CSS variable based tokens</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-background border" />
                  <div>
                    <p className="font-medium">Background</p>
                    <p className="text-xs text-muted-foreground">bg-background</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-foreground" />
                  <div>
                    <p className="font-medium">Foreground</p>
                    <p className="text-xs text-muted-foreground">bg-foreground</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-primary" />
                  <div>
                    <p className="font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">bg-primary</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-secondary" />
                  <div>
                    <p className="font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground">bg-secondary</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted" />
                  <div>
                    <p className="font-medium">Muted</p>
                    <p className="text-xs text-muted-foreground">bg-muted</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-accent" />
                  <div>
                    <p className="font-medium">Accent</p>
                    <p className="text-xs text-muted-foreground">bg-accent</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-destructive" />
                  <div>
                    <p className="font-medium">Destructive</p>
                    <p className="text-xs text-muted-foreground">bg-destructive</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-card border" />
                  <div>
                    <p className="font-medium">Card</p>
                    <p className="text-xs text-muted-foreground">bg-card</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Colors */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Chart Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="h-20 rounded-lg bg-chart-1" />
                    <p className="text-xs text-center text-muted-foreground">chart-1</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 rounded-lg bg-chart-2" />
                    <p className="text-xs text-center text-muted-foreground">chart-2</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 rounded-lg bg-chart-3" />
                    <p className="text-xs text-center text-muted-foreground">chart-3</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 rounded-lg bg-chart-4" />
                    <p className="text-xs text-center text-muted-foreground">chart-4</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 rounded-lg bg-chart-5" />
                    <p className="text-xs text-center text-muted-foreground">chart-5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Components Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">UI Components</h2>
            <p className="text-muted-foreground">All installed Shadcn UI components</p>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Primary interaction elements</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge>
                <Check className="h-3 w-3 mr-1" />
                With Icon
              </Badge>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Important messages and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>This is a default alert with an icon and description.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search with Icon</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search" placeholder="Search..." className="pl-9" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>

              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Select</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Slider</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>User profile images</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar className="h-16 w-16">
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          {/* Progress & Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Progress indicators and skeletons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Progress</Label>
                <Progress value={65} />
              </div>
              <div className="space-y-2">
                <Label>Skeleton</Label>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Organize content into sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Make changes to your account here.</p>
                </TabsContent>
                <TabsContent value="password" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Change your password here.</p>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Manage your settings here.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Card Title</CardTitle>
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a standard card component with header, content, and footer sections.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Quick Action</CardTitle>
                    <CardDescription>Fast and efficient</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards can contain any combination of content and components.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="text-2xl font-bold">1,234</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Now</span>
                  <span className="text-2xl font-bold">56</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Icons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Lucide Icons</h2>
            <p className="text-muted-foreground">Commonly used icon set</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Icon Examples</CardTitle>
              <CardDescription>Standard size and interactive states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6">
                {[
                  { icon: Home, label: "Home" },
                  { icon: User, label: "User" },
                  { icon: Mail, label: "Mail" },
                  { icon: Settings, label: "Settings" },
                  { icon: Bell, label: "Bell" },
                  { icon: Calendar, label: "Calendar" },
                  { icon: FileText, label: "FileText" },
                  { icon: Heart, label: "Heart" },
                  { icon: Search, label: "Search" },
                  { icon: Star, label: "Star" },
                  { icon: Zap, label: "Zap" },
                  { icon: Check, label: "Check" },
                  { icon: ChevronRight, label: "Chevron" },
                  { icon: AlertCircle, label: "Alert" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
