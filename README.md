# Drill AI Intelligence Platform

**Author: AI Assistant**

A comprehensive AI-powered platform for oil drilling data management and analysis, built with Next.js, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Well List Management**: Interactive sidebar displaying wells with depth information
- **File Upload & Processing**: Excel file upload with real-time data processing
- **Data Visualization**: Interactive charts for drilling data analysis
  - Rock Composition (SH, SS, LS, DOL, ANH, Coal, Salt)
  - DT (Delta T) measurements
  - GR (Gamma Ray) readings
- **AI Chatbot Integration**: Intelligent assistant for drilling data analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- Real-time data processing and visualization
- Interactive charts with tooltips and legends
- File persistence and data management
- AI-powered chatbot with context awareness
- Modern UI/UX with Tailwind CSS
- TypeScript for type safety
- API routes for backend functionality

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── WellList.tsx    # Well selection sidebar
│   │   ├── DrillingCharts.tsx # Data visualization
│   │   ├── Chatbot.tsx     # AI chat interface
│   │   └── FileUpload.tsx  # File upload component
│   ├── api/                # API routes
│   │   ├── upload/         # File processing endpoint
│   │   └── chat/           # AI chatbot endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard
```

### Backend Architecture
- **API Routes**: Next.js API routes for file processing and AI integration
- **File Processing**: Excel file parsing using XLSX library
- **AI Integration**: OpenAI GPT integration for intelligent responses
- **Data Storage**: File-based storage with uploads directory

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **File Processing**: XLSX library
- **AI**: OpenAI GPT-3.5-turbo
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📊 Data Visualization

The platform provides three main chart types:

1. **Rock Composition Chart**: Stacked bar chart showing percentage composition of different rock types
2. **DT (Delta T) Chart**: Line chart displaying acoustic travel time measurements
3. **GR (Gamma Ray) Chart**: Line chart showing natural gamma radiation readings

All charts are interactive with:
- Hover tooltips showing detailed data
- Responsive design for different screen sizes
- Depth-based Y-axis for geological context

## 🤖 AI Chatbot Features

The Drill AI chatbot provides:
- Context-aware responses about drilling data
- Analysis of uploaded Excel data
- Explanations of geological formations
- Drilling recommendations and troubleshooting
- Real-time conversation with message history

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- Modal API key (free)

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Modal API key:
   - Get your API key from [Modal Labs](https://modal.com/)
   - Create `.env.local` file in project root:
     ```
     MODAL_API_KEY=your-modal-api-key-here
     ```
   - Test the API key: `node test-modal.js`
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. Deploy automatically on push to main branch

#### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure your hosting platform with the built files

## 🔧 CI/CD Pipeline

The project includes a GitHub Actions workflow for automated deployment:

### Workflow Features
- **Automated Testing**: Linting and build verification
- **Deployment**: Automatic deployment to Vercel on main branch pushes
- **Environment Management**: Secure handling of API keys and secrets
- **Quality Gates**: Build must pass before deployment

### Setup Instructions
1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel authentication token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID

2. The workflow will automatically:
   - Install dependencies
   - Run linting
   - Build the application
   - Deploy to Vercel

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile**: Stacked layout with collapsible sidebars
- **Tablet**: Optimized spacing and touch-friendly interactions
- **Desktop**: Full three-panel layout with all features visible

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Considerations

- API keys stored as environment variables
- File upload validation and sanitization
- Input validation on all user inputs
- Secure file storage in uploads directory
- Rate limiting on API endpoints (recommended for production)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Well selection updates charts
- [ ] File upload processes Excel data correctly
- [ ] Charts display with proper data
- [ ] Chatbot responds to queries
- [ ] Responsive design works on all devices
- [ ] Error handling for invalid files

### Automated Testing (Recommended Additions)
- Unit tests for components
- Integration tests for API routes
- E2E tests for user workflows
- Performance testing for large datasets

## 📈 Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in webpack bundle analyzer
- **Caching**: API response caching
- **Lazy Loading**: Component-level lazy loading

## 🔮 Future Enhancements

### Planned Features
- **Real-time Data Streaming**: WebSocket integration for live data
- **Advanced Analytics**: Machine learning models for drilling optimization
- **User Authentication**: Multi-user support with role-based access
- **Data Export**: PDF and Excel export functionality
- **Mobile App**: React Native mobile application
- **Database Integration**: PostgreSQL for persistent data storage

### Technical Improvements
- **Testing Suite**: Comprehensive test coverage
- **Monitoring**: Application performance monitoring
- **Error Tracking**: Sentry integration for error reporting
- **API Documentation**: OpenAPI/Swagger documentation
- **Containerization**: Docker support for deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation for integration help

## 🎯 Demo Video

A 5-minute demo video showcasing:
- Frontend design and UI interactions
- Backend integration and API functionality
- File upload and data visualization
- AI chatbot capabilities
- Responsive design across devices

---

**Built with ❤️ for the oil and gas industry**