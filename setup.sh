#!/bin/bash

echo "🚀 Setting up Gallery UI..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional dependencies for Tailwind CSS v3
echo "🎨 Installing Tailwind CSS dependencies..."
npm install @tailwindcss/forms @tailwindcss/typography autoprefixer postcss

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.local << EOF
# Gallery API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false

# Optional: Set default page size
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=12

# Optional: Set max file size for uploads (in bytes)
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
EOF

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Make sure your NestJS API is running on http://localhost:3001"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Features included:"
echo "• Beautiful responsive gallery with smooth animations"
echo "• Real-time notifications via SSE"
echo "• AI chat assistant with MCP integration"
echo "• Image management (view, download, metadata)"
echo "• Pagination and search functionality"
echo "• Mobile-optimized design"
echo ""
echo "🔧 Customization:"
echo "• Edit .env.local to change API URL or settings"
echo "• Modify components in src/components/"
echo "• Update styles in src/app/globals.css"
echo "• Add new features using the existing hooks and API client"
