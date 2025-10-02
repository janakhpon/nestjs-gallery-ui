# Gallery UI - Next.js Frontend

A modern, responsive image gallery frontend built with Next.js, TypeScript, and Tailwind CSS. Features real-time notifications, AI-powered chat assistant, and smooth animations.

## 🚀 Features

- **Modern Gallery Interface**: Beautiful grid/list view with smooth animations
- **Real-time Notifications**: Live updates for image processing status
- **AI Chat Assistant**: ChatGPT-like interface for gallery management
- **Responsive Design**: Works perfectly on desktop and mobile
- **Image Management**: View, download, and manage your images
- **Smooth Animations**: Framer Motion powered transitions
- **Type Safety**: Full TypeScript support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_DEBUG=false
   NEXT_PUBLIC_DEFAULT_PAGE_SIZE=12
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 UI Components

### Gallery Components
- **ImageGrid**: Responsive grid layout with pagination
- **ImageCard**: Individual image cards with hover effects
- **ImageModal**: Full-screen image viewer with metadata
- **Pagination**: Smooth pagination controls

### Chat Components
- **ChatBot**: Main chat interface with connection status
- **ChatMessage**: Individual message bubbles
- **ChatInput**: Message input with file upload support

### UI Components
- **Button**: Reusable button with variants
- **Input**: Form input with validation states

## 🔧 Custom Hooks

- **useImages**: Image data fetching and management
- **useNotifications**: Real-time notification handling
- **useMCPChat**: AI chat integration

## 🎭 Animations

The app uses Framer Motion for smooth animations:
- Page transitions
- Component entrance/exit animations
- Hover effects
- Loading states
- Chat message animations

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive breakpoints
- **Touch-friendly**: Large touch targets and gestures
- **Adaptive layouts**: Grid adjusts based on screen size

## 🔌 API Integration

The frontend integrates with the NestJS Gallery API:
- **Images API**: CRUD operations for images
- **MCP API**: AI chat functionality
- **Notifications API**: Real-time updates via SSE

## 📊 Monitoring

The application includes a complete monitoring stack:
- **Grafana Dashboard**: http://localhost:3002 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090
- **API Health**: http://localhost:3001/health

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── gallery/        # Gallery-specific components
│   ├── chat/           # Chat components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API client
└── types/              # TypeScript type definitions
```

## 🎯 Key Features

### Real-time Updates
- Server-Sent Events (SSE) for live notifications
- Automatic gallery refresh on image status changes
- Connection status indicators

### AI Chat Integration
- Natural language gallery management
- File upload via chat
- Context-aware responses
- Message history

### Image Management
- High-quality image display
- Download with presigned URLs
- Metadata viewing
- Status tracking

### Performance
- Image lazy loading
- Optimized bundle size
- Efficient caching with React Query
- Smooth animations without performance impact

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_DEBUG`: Enable debug mode
- `NEXT_PUBLIC_DEFAULT_PAGE_SIZE`: Default images per page
- `NEXT_PUBLIC_MAX_FILE_SIZE`: Maximum file size for uploads

### Tailwind Configuration
Custom animations and utilities are defined in `tailwind.config.ts`:
- Custom color palette
- Animation keyframes
- Responsive breakpoints
- Component utilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API integration guide