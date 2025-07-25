# StatisticsBox Component

A sophisticated statistics display component that uses SVG masking to reveal background images through text, creating a unique visual effect similar to premium WordPress themes.

## Features

- **SVG Masking Effect**: Text acts as a mask to reveal the background image through letters and numbers
- **Animated Counters**: Numbers animate from 0 to their final values when the component becomes visible
- **Two-Column Layout**: Statistics on the left, descriptive text on the right (like premium themes)
- **Intersection Observer**: Animation triggers only when the component is in the viewport
- **Responsive Design**: Adapts to mobile (stacked layout) and desktop screens
- **Customizable**: Supports custom statistics data, titles, descriptions, and background images
- **Professional Styling**: Matches high-end WordPress theme aesthetics

## Usage

### Basic Usage
```jsx
import StatisticsBox from '../components/StatisticsBox';

function MyPage() {
  return (
    <div>
      <StatisticsBox />
    </div>
  );
}
```

### Custom Values
```jsx
<StatisticsBox 
  projectsDone={150}
  happyClients={75}
  workingHours={2500}
  awards={5}
/>
```

### Custom Statistics with Different Data
```jsx
const customStats = [
  { key: 'clients', value: 200, label: 'SATISFIED CLIENTS' },
  { key: 'projects', value: 150, label: 'COMPLETED PROJECTS' },
  { key: 'experience', value: 10, label: 'YEARS EXPERIENCE' },
  { key: 'team', value: 25, label: 'TEAM MEMBERS' }
];

<StatisticsBox 
  customStats={customStats}
  title="Our Company in Numbers"
  subtitle="ACHIEVEMENTS"
  description="We pride ourselves on delivering exceptional results..."
  backgroundImage="/images/your-background.jpg"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projectsDone` | number | 157 | Number of completed projects |
| `happyClients` | number | 86 | Number of satisfied clients |
| `workingHours` | number | 924 | Total working hours |
| `awards` | number | 13 | Number of awards received |
| `customStats` | array | null | Custom statistics array (overrides default props) |
| `title` | string | "Make with love all what we do." | Section title (supports HTML) |
| `subtitle` | string | "NUMBERS" | Section subtitle |
| `description` | string | Default description | Section description text |
| `backgroundImage` | string | "/images/statistics-pic.jpeg" | URL to background image for SVG masking |

## Custom Stats Array Format

When using `customStats`, each object should have:
- `key`: Unique identifier for the statistic
- `value`: The final number to count up to
- `label`: Display label for the statistic
- `x`: Horizontal position percentage for SVG text positioning
- `numberY`: Vertical position percentage for the number text
- `titleY`: Vertical position percentage for the label text

## Styling

The component uses CSS with the following main classes:
- `.statistics-section`: Main container
- `.statistics-row`: Flex container for two-column layout
- `.statistics-counter-column`: Left column containing the SVG statistics
- `.statistics-text-column`: Right column containing the descriptive text
- `.counter-outer`: Background image container
- `.stat-svg`: Individual SVG element for each statistic
- `.count.number`: SVG text for numbers
- `.count.title`: SVG text for labels

## Animation Details

- **Duration**: 2 seconds
- **Easing**: Ease-out quart function for smooth deceleration
- **Trigger**: Intersection Observer with 30% threshold
- **Steps**: 60 animation frames for smooth counting

## Browser Support

- Modern browsers with Intersection Observer support
- Graceful degradation for older browsers (numbers appear without animation)
- Mobile responsive design for all screen sizes

## Dependencies

- React 16.8+ (uses hooks)
- No external dependencies required