# FIR Dashboard

A modern, interactive dashboard for visualizing First Information Report (FIR) data from Jalna District, Maharashtra. Built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- **Interactive Map**: View incident locations with custom markers
- **Heatmap Visualization**: See crime density patterns across the district
- **Real-time Filtering**: Filter by police station, incident type, and date range
- **Statistics Dashboard**: Key metrics and insights
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface using Shadcn UI components

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Maps**: Leaflet with React Leaflet
- **Heatmap**: Leaflet.heat
- **Data**: JSON-based FIR records with coordinates

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fir-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Structure

The dashboard uses FIR data stored in `public/data/fir_database_en_with_coordinates.json`. Each record contains:

- **FIR Details**: Number, police station, district, timestamp
- **Incident Details**: Date, time, location with coordinates
- **Legal Information**: Applied sections and acts
- **People Involved**: Complainants, accused, witnesses, deceased
- **Vehicles**: Registration details and roles
- **Narrative**: Summary and keywords
- **Administrative**: Officer details and source references

## Map Features

### Individual Markers
- Color-coded markers based on incident type:
  - 🟠 Orange: Accidents/collisions
  - 🔵 Blue: Theft/robbery
  - 🔴 Red: Violence/assaults
- Detailed popups with incident information
- Click to view full details

### Heatmap Layer
- Density visualization of incidents
- Color gradient from blue (low) to red (high)
- Adjustable radius and blur settings
- Toggle between marker and heatmap views

## Filtering Options

- **Police Station**: Filter by specific police stations
- **Incident Type**: Filter by keywords (accident, theft, etc.)
- **Date Range**: Filter by incident dates (coming soon)
- **Clear Filters**: Reset all filters

## Statistics

The dashboard displays key metrics:
- Total incidents in the database
- Number of active police stations
- Incidents in the current month
- Most common incident type
- Average distance from police stations

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── MapComponent.tsx # Main map component
│   └── StatsCards.tsx   # Statistics display
├── lib/                # Utility functions
│   ├── data.ts         # Data loading and processing
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
    └── fir.ts          # FIR data interfaces
```

### Adding New Features

1. **New Map Layers**: Extend `MapComponent.tsx`
2. **Additional Filters**: Update the filter logic in `page.tsx`
3. **New Statistics**: Modify `calculateDashboardStats()` in `data.ts`
4. **Custom Markers**: Update the `getMarkerIcon()` function

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel**: `npm run build && vercel --prod`
- **Netlify**: `npm run build && netlify deploy --prod --dir=out`
- **Docker**: Use the included Dockerfile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Data Source

The FIR data is sourced from official police records of Jalna District, Maharashtra, India. All data has been anonymized and processed for analytical purposes.