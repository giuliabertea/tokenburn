## ADDED Requirements

### Requirement: Three-tab layout — Sessions, Patterns, Templates
The system SHALL render a single-page React 18 application with a persistent tab bar at the top containing three tabs: "Sessions", "Patterns", "Templates". Clicking a tab SHALL switch the active view without a full page reload.

#### Scenario: Sessions tab is active by default
- **WHEN** the user navigates to localhost:4242
- **THEN** the Sessions tab is active and the Sessions view is rendered

#### Scenario: Tab switching
- **WHEN** the user clicks the Patterns tab
- **THEN** the Patterns view replaces the Sessions view and the Patterns tab appears active

### Requirement: Sessions tab — SessionList and SessionDetail
The Sessions view SHALL render a split layout: a scrollable SessionList on the left and a SessionDetail panel on the right. Clicking a session in the list SHALL load that session's detail in the right panel.

SessionDetail SHALL contain:
- A RadialGauge showing savings percentage (animated on mount)
- Animated WasteBars for each detected waste pattern (bars animate width from 0 to final value)
- An InsightCard displaying the insight text
- Task name, category, date, and quality rating (editable via star input calling POST /api/sessions/:id/quality)

#### Scenario: Session selected from list
- **WHEN** the user clicks a session in the SessionList
- **THEN** the SessionDetail panel renders with the correct session data and the RadialGauge animates

#### Scenario: Quality rating updated
- **WHEN** the user clicks a star in the quality input
- **THEN** POST /api/sessions/:id/quality is called and the displayed rating updates

#### Scenario: No session selected
- **WHEN** the Sessions tab first loads and no session is selected
- **THEN** the right panel shows a placeholder message

### Requirement: RadialGauge component — animated SVG arc
The system SHALL implement a RadialGauge component that renders an SVG arc representing a percentage value (0–100). The arc SHALL animate from 0° to its target angle over 800 ms on mount. The color SHALL be `--success` for values ≥ 50%, `--warning` for 25–49%, `--danger` for < 25%.

#### Scenario: Gauge animates on mount
- **WHEN** RadialGauge is mounted with value=62
- **THEN** the SVG arc animates over 800 ms to represent 62%

#### Scenario: Color threshold — success
- **WHEN** value is 75
- **THEN** the arc stroke color is var(--success)

### Requirement: Patterns tab — heatmap, sparkline, top waste, biggest leak card
The Patterns view SHALL contain:
- PatternHeatmap: a grid of category (rows) × day of week (columns), with cell color intensity proportional to tokens wasted that day in that category
- SparkLine: a line chart of efficiency ratio over time (last 30 sessions), animated on mount
- Top waste patterns section with WasteBars
- "Your biggest leak" card naming the top pattern with a remediation recommendation

#### Scenario: Heatmap renders categories as rows
- **WHEN** the Patterns tab loads and sessions exist across 3 categories
- **THEN** the heatmap renders 3 rows, one per category

#### Scenario: Biggest leak card populated
- **WHEN** the top pattern is `verbose_spec_style`
- **THEN** the card displays "verbose_spec_style" and a specific recommendation

### Requirement: Templates tab — list, token preview, copy button
The Templates view SHALL fetch GET /api/templates and render a list where each template shows: name, token count, and a "Copy" button that copies the raw content to the clipboard.

#### Scenario: Copy button copies template content
- **WHEN** the user clicks "Copy" on the auth template
- **THEN** the auth template content is written to the clipboard and a brief confirmation appears

#### Scenario: Templates tab renders all templates
- **WHEN** the API returns 4 templates
- **THEN** 4 template cards are rendered

### Requirement: Design system applied via CSS custom properties
The system SHALL define all design tokens in a root CSS file using the specified values:

```css
--bg-base: #0d1017
--bg-surface: #141824
--bg-elevated: #1e2535
--accent: #748ffc
--success: #63e6be
--warning: #ffa94d
--danger: #ff6b6b
--text-primary: #e2e8f0
--text-muted: #8892a4
--text-faint: #4a5568
--font-mono: 'JetBrains Mono', monospace
--font-display: 'Syne', sans-serif
```

No UI library SHALL be used. All styles SHALL be plain CSS using these custom properties.

#### Scenario: Dashboard background matches spec
- **WHEN** the dashboard loads
- **THEN** the body background color is #0d1017

### Requirement: All components animate on mount
The system SHALL apply a fade-in + slide-up animation to every top-level component when it first mounts. Animation duration SHALL be 300 ms with ease-out timing.

#### Scenario: Component animates on first render
- **WHEN** the Sessions view mounts
- **THEN** the SessionList and SessionDetail panels fade in and slide up over 300 ms

### Requirement: useSessionData hook — data fetching with loading and error states
The system SHALL implement a `useSessionData` hook that wraps fetch calls to the local API. It SHALL return `{ data, loading, error }`. While the request is in-flight, `loading` is true. On network error, `error` is set and `data` is null.

#### Scenario: Loading state during fetch
- **WHEN** the hook is first called
- **THEN** loading is true until the fetch completes

#### Scenario: Error state on network failure
- **WHEN** the API server is not running
- **THEN** error is set to an Error object and loading is false

### Requirement: Dashboard served fully offline — no CDN, no cloud
The system SHALL bundle all fonts, icons, and assets locally. No requests to external CDNs SHALL be made at runtime. The JetBrains Mono and Syne fonts SHALL be bundled via npm packages or local font files.

#### Scenario: Dashboard loads with network blocked
- **WHEN** the browser has no internet access
- **THEN** the dashboard loads fully with correct fonts and no console errors about failed resource loads
