import {useState, type ReactNode} from 'react'
import {AlertTriangle, CheckCircle2, Download, FolderOpen, Info, Link2, Pause, Play, Search, Trash2, XCircle} from 'lucide-react'
import {ThemeToggle} from '../components/system/ThemeToggle.js'
import {Alert, AlertDescription, AlertTitle} from '../components/ui/alert.js'
import {Badge} from '../components/ui/badge.js'
import {Button} from '../components/ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card.js'
import {Checkbox} from '../components/ui/checkbox.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '../components/ui/dialog.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from '../components/ui/empty.js'
import {Field, FieldDescription, FieldError, FieldLabel} from '../components/ui/field.js'
import {Input} from '../components/ui/input.js'
import {InputGroup, InputGroupAddon, InputGroupInput} from '../components/ui/input-group.js'
import {Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle} from '../components/ui/item.js'
import {Kbd, KbdGroup} from '../components/ui/kbd.js'
import {Progress} from '../components/ui/progress.js'
import {RadioGroup, RadioGroupItem} from '../components/ui/radio-group.js'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select.js'
import {Separator} from '../components/ui/separator.js'
import {Skeleton} from '../components/ui/skeleton.js'
import {Spinner} from '../components/ui/spinner.js'
import {Switch} from '../components/ui/switch.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs.js'
import {Textarea} from '../components/ui/textarea.js'
import {ToggleGroup, ToggleGroupItem} from '../components/ui/toggle-group.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../components/ui/tooltip.js'

// Design-system sheet for the browser-mock workbench (`?kit`). Every primitive in
// every variant, on the real glass surfaces, in whichever sky and direction the
// knobs select. Review a primitive change here before reviewing any screen.

const BUTTON_VARIANTS = ['glow', 'default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg'] as const
const BADGE_VARIANTS = ['default', 'secondary', 'outline', 'success', 'warning', 'info', 'destructive'] as const
const ALERTS = [
	{variant: 'default', icon: Info, title: 'Default', body: 'Neutral information on a card surface.'},
	{variant: 'info', icon: Info, title: 'Info', body: 'Something the user may want to know.'},
	{variant: 'success', icon: CheckCircle2, title: 'Success', body: 'The download finished and the file is in place.'},
	{variant: 'warning', icon: AlertTriangle, title: 'Warning', body: 'YouTube limited this video to 360p.'},
	{variant: 'destructive', icon: XCircle, title: 'Error', body: 'Bot protection blocked the request. Try again later.'}
] as const
const TOKENS = [
	['background', 'bg-background'],
	['card', 'bg-card'],
	['popover', 'bg-popover'],
	['muted', 'bg-muted'],
	['primary', 'bg-primary'],
	['primary/12', 'bg-primary/12'],
	['success', 'bg-success'],
	['warning', 'bg-warning'],
	['destructive', 'bg-destructive'],
	['border', 'bg-border'],
	['border-strong', 'bg-border-strong']
] as const
// A Greek label is among the longest the app ships; it proves the wrap contract.
const LONG_LABEL = 'Συμβατότητα με έξυπνη τηλεόραση'

function Section({title, children}: {title: string; children: ReactNode}): ReactNode {
	return (
		<section className="glow-panel flex flex-col gap-4 rounded-2xl p-5" data-testid={`kit-${title.toLowerCase().replace(/\W+/g, '-')}`}>
			<h2 className="text-headline">{title}</h2>
			{children}
		</section>
	)
}

function Row({label, children}: {label: string; children: ReactNode}): ReactNode {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-caption text-muted-foreground">{label}</span>
			<div className="flex flex-wrap items-center gap-2">{children}</div>
		</div>
	)
}

function DirectionToggle(): ReactNode {
	const [dir, setDir] = useState(() => document.documentElement.dir || 'ltr')
	return (
		<ToggleGroup
			size="sm"
			variant="outline"
			value={[dir]}
			onValueChange={next => {
				const value = next[0]
				if (value !== 'ltr' && value !== 'rtl') return
				document.documentElement.dir = value
				setDir(value)
			}}
		>
			<ToggleGroupItem value="ltr">LTR</ToggleGroupItem>
			<ToggleGroupItem value="rtl">RTL</ToggleGroupItem>
		</ToggleGroup>
	)
}

export function UiKit({onExit}: {onExit: () => void}): ReactNode {
	const [progress, setProgress] = useState(42)
	return (
		<div className="relative z-10 flex h-screen flex-col" data-testid="ui-kit">
			<header className="chrome-glass flex flex-wrap items-center gap-3 border-b px-5 py-3">
				<h1 className="text-title">Arroxy UI Kit</h1>
				<div className="ms-auto flex flex-wrap items-center gap-2">
					<ThemeToggle />
					<DirectionToggle />
					<Button variant="ghost" size="sm" onClick={onExit}>
						Exit kit
					</Button>
				</div>
			</header>

			<main className="min-h-0 flex-1 overflow-y-auto">
				<div className="mx-auto grid max-w-6xl gap-5 p-5 lg:grid-cols-2">
					<Section title="Typography">
						<p className="text-display">Display: one per view</p>
						<p className="text-headline">Headline: card and dialog titles</p>
						<p className="text-title">Title: row titles, profile names</p>
						<p className="text-sm">Body (sm): descriptions and helper text that explains what a control does.</p>
						<p className="text-xs text-muted-foreground">Extra small: secondary metadata</p>
						<p className="text-caption text-muted-foreground">Caption: timestamps, counts, hints</p>
						<p className="text-label text-subtle-foreground uppercase">Label: section eyebrow</p>
						<p className="font-mono text-sm tabular-nums">Mono: 1080p · 2.2 GB · 42%</p>
					</Section>

					<Section title="Colour tokens">
						<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{TOKENS.map(([name, swatch]) => (
								<div key={name} className="flex flex-col gap-1.5">
									<div className={`h-10 rounded-lg border border-border-strong ${swatch}`} />
									<span className="text-caption text-muted-foreground">{name}</span>
								</div>
							))}
						</div>
						<Separator />
						<div className="flex flex-wrap gap-4 text-sm">
							<span className="text-foreground">foreground</span>
							<span className="text-muted-foreground">muted-foreground</span>
							<span className="text-subtle-foreground">subtle-foreground</span>
							<span className="text-primary">primary</span>
							<span className="text-success">success</span>
							<span className="text-warning">warning</span>
							<span className="text-destructive">destructive</span>
						</div>
					</Section>

					<Section title="Buttons">
						{BUTTON_VARIANTS.map(variant => (
							<Row key={variant} label={variant}>
								{BUTTON_SIZES.map(size => (
									<Button key={size} variant={variant} size={size}>
										{size}
									</Button>
								))}
								<Button variant={variant} disabled>
									Disabled
								</Button>
							</Row>
						))}
						<Row label="icon sizes">
							<Button variant="outline" size="icon-xs" aria-label="Pause">
								<Pause />
							</Button>
							<Button variant="outline" size="icon-sm" aria-label="Play">
								<Play />
							</Button>
							<Button variant="outline" size="icon" aria-label="Open folder">
								<FolderOpen />
							</Button>
							<Button variant="destructive" size="icon-lg" aria-label="Delete">
								<Trash2 />
							</Button>
							<Button variant="glow">
								<Download data-icon="inline-start" />
								Pull it!
							</Button>
						</Row>
					</Section>

					<Section title="Segmented controls">
						<Row label="default · sm">
							<ToggleGroup size="sm" defaultValue={['next']}>
								<ToggleGroupItem value="next">Next to video</ToggleGroupItem>
								<ToggleGroupItem value="embed">Embed into video</ToggleGroupItem>
								<ToggleGroupItem value="folder">Subtitles folder</ToggleGroupItem>
							</ToggleGroup>
						</Row>
						<Row label="outline · default">
							<ToggleGroup variant="outline" defaultValue={['balanced']}>
								<ToggleGroupItem value="off">Off</ToggleGroupItem>
								<ToggleGroupItem value="balanced">Balanced</ToggleGroupItem>
								<ToggleGroupItem value="careful">Careful</ToggleGroupItem>
								<ToggleGroupItem value="custom">Custom</ToggleGroupItem>
							</ToggleGroup>
						</Row>
						<Row label="chip shape (short tokens)">
							<ToggleGroup size="sm" variant="outline" className="flex-wrap" defaultValue={['192']}>
								{['128', '192', '256', '320'].map(rate => (
									<ToggleGroupItem key={rate} value={rate} shape="chip">
										{rate}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</Row>
						<Row label="long localized label wraps">
							<ToggleGroup variant="outline" className="w-72" defaultValue={['a']}>
								<ToggleGroupItem value="a">{LONG_LABEL}</ToggleGroupItem>
								<ToggleGroupItem value="b">Off</ToggleGroupItem>
							</ToggleGroup>
						</Row>
					</Section>

					<Section title="Form controls">
						<Field>
							<FieldLabel htmlFor="kit-url">URL</FieldLabel>
							<InputGroup className="glow-tile h-11">
								<InputGroupAddon>
									<Link2 />
								</InputGroupAddon>
								<InputGroupInput id="kit-url" placeholder="https://…" />
							</InputGroup>
						</Field>
						<Field>
							<FieldLabel htmlFor="kit-name">Profile name</FieldLabel>
							<Input id="kit-name" defaultValue="Study captions" />
							<FieldDescription>Shown in Quick Download and every profile list.</FieldDescription>
						</Field>
						<Field data-invalid>
							<FieldLabel htmlFor="kit-rate">Speed limit</FieldLabel>
							<Input id="kit-rate" aria-invalid defaultValue="-5" />
							<FieldError>Enter a number above zero.</FieldError>
						</Field>
						<InputGroup>
							<InputGroupAddon>
								<Search />
							</InputGroupAddon>
							<InputGroupInput placeholder="Search languages…" />
						</InputGroup>
						<Select defaultValue="m4a">
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="m4a">M4A / AAC</SelectItem>
								<SelectItem value="mp3">MP3</SelectItem>
								<SelectItem value="opus">Opus</SelectItem>
							</SelectContent>
						</Select>
						<Textarea placeholder="Paste one URL per line" />
						<div className="flex flex-wrap items-center gap-5">
							<Field orientation="horizontal" className="w-auto">
								<Checkbox id="kit-check" defaultChecked />
								<FieldLabel htmlFor="kit-check">English</FieldLabel>
							</Field>
							<Field orientation="horizontal" className="w-auto">
								<Switch id="kit-switch" defaultChecked />
								<FieldLabel htmlFor="kit-switch">Embed chapters</FieldLabel>
							</Field>
						</div>
						<RadioGroup defaultValue="2160">
							{['2160p', '1080p', '720p'].map(label => (
								<Field key={label} orientation="horizontal">
									<RadioGroupItem id={`kit-radio-${label}`} value={label.replace('p', '')} aria-labelledby={`kit-radio-${label}-label`} />
									<FieldLabel id={`kit-radio-${label}-label`} htmlFor={`kit-radio-${label}`}>
										{label}
									</FieldLabel>
								</Field>
							))}
						</RadioGroup>
					</Section>

					<Section title="Badges">
						<Row label="default size">
							{BADGE_VARIANTS.map(variant => (
								<Badge key={variant} variant={variant}>
									{variant}
								</Badge>
							))}
						</Row>
						<Row label="sm">
							{BADGE_VARIANTS.map(variant => (
								<Badge key={variant} variant={variant} size="sm">
									{variant}
								</Badge>
							))}
						</Row>
						<Row label="keyboard">
							<KbdGroup>
								<Kbd>Ctrl</Kbd>
								<Kbd>Shift</Kbd>
								<Kbd>D</Kbd>
							</KbdGroup>
						</Row>
					</Section>

					<Section title="Alerts">
						{ALERTS.map(({variant, icon: Icon, title, body}) => (
							<Alert key={variant} variant={variant}>
								<Icon />
								<AlertTitle>{title}</AlertTitle>
								<AlertDescription>{body}</AlertDescription>
							</Alert>
						))}
					</Section>

					<Section title="Surfaces">
						<div className="glow-tile rounded-xl p-4 text-sm">glow-tile: a tile inside a glow-panel</div>
						<Card>
							<CardHeader>
								<CardTitle>Card</CardTitle>
								<CardDescription>Plain surface for dense screens: settings, dialogs, queue.</CardDescription>
							</CardHeader>
							<CardContent className="text-sm">Card content</CardContent>
						</Card>
						<div className="flex items-center gap-3">
							<div className="icon-tile flex size-10 items-center justify-center rounded-xl">
								<Download />
							</div>
							<span className="text-sm text-muted-foreground">icon-tile</span>
						</div>
						<Item variant="outline">
							<ItemMedia variant="icon">
								<FolderOpen />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>Item</ItemTitle>
								<ItemDescription>Row with media, text, and actions.</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button variant="outline" size="sm">
									Change
								</Button>
							</ItemActions>
						</Item>
					</Section>

					<Section title="Progress and loading">
						<Progress value={progress} />
						<div className="flex flex-wrap items-center gap-3">
							<Button variant="outline" size="sm" onClick={() => setProgress(value => (value + 17) % 101)}>
								Advance
							</Button>
							<Spinner />
							<span className="font-mono text-sm tabular-nums">{progress}%</span>
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-16 rounded-lg" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-3 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</div>
					</Section>

					<Section title="Navigation and overlays">
						<Tabs defaultValue="general">
							<TabsList>
								<TabsTrigger value="general">General</TabsTrigger>
								<TabsTrigger value="network">Network</TabsTrigger>
								<TabsTrigger value="advanced">Advanced</TabsTrigger>
							</TabsList>
							<TabsContent value="general" className="pt-3 text-sm text-muted-foreground">
								General settings
							</TabsContent>
							<TabsContent value="network" className="pt-3 text-sm text-muted-foreground">
								Network settings
							</TabsContent>
							<TabsContent value="advanced" className="pt-3 text-sm text-muted-foreground">
								Advanced settings
							</TabsContent>
						</Tabs>
						<div className="flex flex-wrap items-center gap-2">
							<Tooltip>
								<TooltipTrigger render={<Button variant="outline" size="sm" />}>Hover for tooltip</TooltipTrigger>
								<TooltipContent>Tooltip content</TooltipContent>
							</Tooltip>
							<Dialog>
								<DialogTrigger render={<Button variant="outline" size="sm" />}>Open dialog</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Dialog title</DialogTitle>
										<DialogDescription>Dialogs carry one task and one primary action.</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<Button variant="outline">Cancel</Button>
										<Button variant="glow">Save profile</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</Section>

					<Section title="Empty state">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Download />
								</EmptyMedia>
								<EmptyTitle>No downloads yet</EmptyTitle>
								<EmptyDescription>Paste a link on the URL tab and it lands here.</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Section>
				</div>
			</main>
		</div>
	)
}
