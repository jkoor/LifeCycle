import {
    Check,
    X,
    AlertCircle,
    Info,
    Loader2,
    Star,
    Heart,
    Sparkles,
    Zap,
    Crown,
    Rocket,
    Mail,
    User,
    Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

export default function DesignPlayground() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Design Playground</h1>
                    <p className="text-lg text-muted-foreground">
                        Complete design system showcase for LifeCycle project
                    </p>
                </div>

                {/* Typography Section */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Typography</h2>
                        <p className="text-muted-foreground">Heading and text styles used throughout the application</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Typography Scale</CardTitle>
                            <CardDescription>Standard text hierarchy</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Heading 1</p>
                                    <h1 className="text-4xl font-bold tracking-tight">The quick brown fox jumps</h1>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Heading 2</p>
                                    <h2 className="text-3xl font-bold">The quick brown fox jumps</h2>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Heading 3</p>
                                    <h3 className="text-2xl font-semibold">The quick brown fox jumps</h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Heading 4</p>
                                    <h4 className="text-xl font-semibold">The quick brown fox jumps</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Body Large</p>
                                    <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Body (Base)</p>
                                    <p className="text-base">The quick brown fox jumps over the lazy dog</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Body Small</p>
                                    <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Caption</p>
                                    <p className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Font Weights</h4>
                                <div className="space-y-2">
                                    <p className="font-normal">Normal (400): The quick brown fox</p>
                                    <p className="font-medium">Medium (500): The quick brown fox</p>
                                    <p className="font-semibold">Semibold (600): The quick brown fox</p>
                                    <p className="font-bold">Bold (700): The quick brown fox</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Color Palette Section */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Color Palette</h2>
                        <p className="text-muted-foreground">Tailwind v4 CSS variable-based color system</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Semantic Colors */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Semantic Colors</CardTitle>
                                <CardDescription>Purpose-driven color tokens</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ColorSwatch name="Primary" color="bg-primary" text="text-primary-foreground" />
                                <ColorSwatch name="Secondary" color="bg-secondary" text="text-secondary-foreground" />
                                <ColorSwatch name="Destructive" color="bg-destructive" text="text-destructive-foreground" />
                                <ColorSwatch name="Muted" color="bg-muted" text="text-muted-foreground" />
                                <ColorSwatch name="Accent" color="bg-accent" text="text-accent-foreground" />
                            </CardContent>
                        </Card>

                        {/* Surface Colors */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Surface Colors</CardTitle>
                                <CardDescription>Background and container colors</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ColorSwatch name="Background" color="bg-background" text="text-foreground" />
                                <ColorSwatch name="Card" color="bg-card" text="text-card-foreground" />
                                <ColorSwatch name="Popover" color="bg-popover" text="text-popover-foreground" />
                                <div className="rounded-lg border border-border bg-background p-4">
                                    <p className="text-sm"><span className="font-medium">Border:</span> oklch(0.922 0 0)</p>
                                </div>
                                <div className="rounded-lg border border-input bg-background p-4">
                                    <p className="text-sm"><span className="font-medium">Input:</span> oklch(0.922 0 0)</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chart Colors */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Chart Colors</CardTitle>
                                <CardDescription>Data visualization palette</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-5">
                                    <ColorSwatch name="Chart 1" color="bg-chart-1" text="text-background" />
                                    <ColorSwatch name="Chart 2" color="bg-chart-2" text="text-background" />
                                    <ColorSwatch name="Chart 3" color="bg-chart-3" text="text-background" />
                                    <ColorSwatch name="Chart 4" color="bg-chart-4" text="text-background" />
                                    <ColorSwatch name="Chart 5" color="bg-chart-5" text="text-background" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Components Section */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Shadcn UI Components</h2>
                        <p className="text-muted-foreground">Currently installed component library</p>
                    </div>

                    {/* Buttons */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Buttons</CardTitle>
                            <CardDescription>All button variants and sizes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Variants</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="default">Default</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="destructive">Destructive</Button>
                                    <Button variant="link">Link</Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Sizes</h4>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button size="xs">Extra Small</Button>
                                    <Button size="sm">Small</Button>
                                    <Button size="default">Default</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">With Icons</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button>
                                        <Mail data-icon="inline-start" />
                                        Email
                                    </Button>
                                    <Button variant="secondary">
                                        Settings
                                        <Settings data-icon="inline-end" />
                                    </Button>
                                    <Button size="icon" variant="outline">
                                        <Star />
                                    </Button>
                                    <Button size="icon-sm" variant="ghost">
                                        <Heart />
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">States</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button disabled>Disabled</Button>
                                    <Button>
                                        <Loader2 className="animate-spin" data-icon="inline-start" />
                                        Loading
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badges</CardTitle>
                            <CardDescription>Status and label indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Badge>Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge>
                                    <Check className="size-3" />
                                    With Icon
                                </Badge>
                                <Badge variant="outline">
                                    <Crown className="size-3" />
                                    Premium
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Inputs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Inputs</CardTitle>
                            <CardDescription>Input fields and text areas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="input-default">Default Input</Label>
                                    <Input id="input-default" placeholder="Enter text..." />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="input-disabled">Disabled Input</Label>
                                    <Input id="input-disabled" placeholder="Disabled" disabled />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="input-error">Error State</Label>
                                    <Input id="input-error" placeholder="Invalid input" aria-invalid />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="input-icon">With Icon</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="input-icon" placeholder="Username" className="pl-9" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="textarea">Textarea</Label>
                                <Textarea id="textarea" placeholder="Enter a longer message..." rows={4} />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="select">Select</Label>
                                <Select>
                                    <SelectTrigger id="select">
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="option-1">Option 1</SelectItem>
                                        <SelectItem value="option-2">Option 2</SelectItem>
                                        <SelectItem value="option-3">Option 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cards</CardTitle>
                            <CardDescription>Container components with various layouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card size="sm">
                                    <CardHeader>
                                        <CardTitle>Small Card</CardTitle>
                                        <CardDescription>Compact size variant</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">Content goes here</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Default Card</CardTitle>
                                        <CardDescription>Standard size</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">Content with more space</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button size="sm" variant="secondary">Action</Button>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <Sparkles className="size-8 text-primary" />
                                        <CardTitle>With Icon</CardTitle>
                                        <CardDescription>Featuring visual elements</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Zap className="size-4 text-chart-3" />
                                            <p className="text-sm">Enhanced content</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alert Dialog */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Dialog</CardTitle>
                            <CardDescription>Modal dialogs for important actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">Open Alert Dialog</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>

                    {/* Separator */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Separator</CardTitle>
                            <CardDescription>Visual dividers for content sections</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <p className="text-sm">Section Above</p>
                                <Separator />
                                <p className="text-sm">Section Below</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Lucide Icons Showcase */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Lucide Icons</h2>
                        <p className="text-muted-foreground">Icon examples used throughout the application</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Common Icons</CardTitle>
                            <CardDescription>Frequently used icon set</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                                <IconDemo icon={<Check />} label="Check" />
                                <IconDemo icon={<X />} label="Close" />
                                <IconDemo icon={<AlertCircle />} label="Alert" />
                                <IconDemo icon={<Info />} label="Info" />
                                <IconDemo icon={<Star />} label="Star" />
                                <IconDemo icon={<Heart />} label="Heart" />
                                <IconDemo icon={<Sparkles />} label="Sparkles" />
                                <IconDemo icon={<Zap />} label="Zap" />
                                <IconDemo icon={<Crown />} label="Crown" />
                                <IconDemo icon={<Rocket />} label="Rocket" />
                                <IconDemo icon={<Mail />} label="Mail" />
                                <IconDemo icon={<User />} label="User" />
                                <IconDemo icon={<Settings />} label="Settings" />
                                <IconDemo icon={<Loader2 />} label="Loader" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Footer */}
                <div className="border-t border-border pt-8 pb-4">
                    <p className="text-center text-sm text-muted-foreground">
                        LifeCycle Design System • Built with Next.js 16, Tailwind v4 & Shadcn UI
                    </p>
                </div>
            </div>
        </div>
    )
}

function ColorSwatch({ name, color, text }: { name: string; color: string; text: string }) {
    return (
        <div className={`rounded-lg ${color} ${text} p-4`}>
            <p className="font-medium">{name}</p>
        </div>
    )
}

function IconDemo({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/30 text-foreground">
                {icon}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}
