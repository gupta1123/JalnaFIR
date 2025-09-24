# Jalna FIR Dashboard

A comprehensive web-based dashboard for managing and analyzing First Information Reports (FIRs) from Jalna district. Built with modern web technologies to provide law enforcement agencies with powerful tools for case management, analytics, and strategic decision-making.

## 🚀 Features

### 📊 **Interactive Dashboard**
- Real-time map visualization with heatmap overlay
- Key performance indicators and statistics
- Responsive design optimized for all devices

### 🔍 **Advanced Search & Discovery**
- Comprehensive case search functionality
- Detailed case information with people involved
- Vehicle tracking and legal sections
- Narrative summaries and incident descriptions

### 📈 **Strategic Analytics**
- Temporal intelligence with 24-hour and weekly patterns
- Case complexity metrics and demographic analysis
- Visual charts and graphs for data insights
- AI-powered insights for decision-making

### 🎨 **Modern UI/UX**
- Built with shadcn/ui components
- Tailwind CSS for responsive styling
- Clean, professional interface
- Excellent user experience design

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet with React integration
- **Data**: JSON-based FIR database
- **Deployment**: GitHub Pages ready

## 📁 Project Structure

```
fir-dashboard/
├── src/
│   ├── app/
│   │   ├── analytics/          # Strategic analytics page
│   │   ├── search/             # Search and case details
│   │   └── page.tsx            # Main dashboard
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── MapComponent.tsx    # Interactive map
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── StatsCards.tsx      # Statistics display
│   ├── lib/
│   │   ├── data.ts             # Data loading utilities
│   │   └── utils.ts            # Helper functions
│   └── types/
│       └── fir.ts              # TypeScript interfaces
├── public/
│   └── data/                   # FIR database files
└── components.json             # shadcn/ui configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/gupta1123/JalnaFIR.git
   cd JalnaFIR
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Data Structure

The dashboard works with FIR data in the following format:

```typescript
interface FIRRecord {
  firDetails: {
    firNumber: string;
    policeStation: string;
    firTimestamp: string;
  };
  incidentDetails: {
    startDate: string;
    startTime: string;
    dayOfWeek: string;
    placeOfOccurrence: {
      address: string;
      distanceFromPS_km: number;
      coordinates?: [number, number];
    };
  };
  personsInvolved: PersonInvolved[];
  vehiclesInvolved: VehicleInvolved[];
  narrativeSummary: {
    summary_en: string;
    keywords: string[];
  };
  sectionsApplied: SectionApplied[];
}
```

## 🎯 Key Features Explained

### **Interactive Map**
- Displays all FIR cases with location markers
- Heatmap overlay shows incident density
- Click markers for quick case details
- Responsive design for mobile and desktop

### **Search System**
- Search by FIR number, location, names, or vehicle numbers
- Detailed case view with comprehensive information
- People categorization (Accused, Victims, Complainants, Witnesses)
- Vehicle involvement tracking

### **Analytics Dashboard**
- **Temporal Intelligence**: 24-hour and weekly crime patterns
- **Case Complexity**: People per case, unknown suspects, multi-vehicle incidents
- **Demographics**: Victim age group analysis
- **Visual Charts**: Area charts, bar charts, and pie charts

## 🚀 Deployment

### GitHub Pages
The project is configured for easy deployment to GitHub Pages:

1. Push code to the `main` branch
2. Enable GitHub Pages in repository settings
3. Select source as "Deploy from a branch"
4. Choose `main` branch and `/` folder

### Vercel (Recommended)
For optimal performance, deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js configuration
3. Deploy with zero configuration

## 📈 Performance Features

- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Optimized images and assets
- **Code Splitting**: Automatic code splitting for better performance
- **Responsive Design**: Mobile-first approach

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - Start development server with hot reload

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🎉 Acknowledgments

- Built for Jalna Police Department
- Data visualization powered by Recharts
- UI components from shadcn/ui
- Maps integration with Leaflet

---

**Built with ❤️ for better law enforcement and public safety**