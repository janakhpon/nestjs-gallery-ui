#!/bin/bash

# Script to update API types in the frontend from the backend
# This ensures the frontend always has the latest API types

set -e

echo "🔄 Updating API types from backend..."

# Check if backend is running
if ! curl -s http://localhost:3001/api/v1/health > /dev/null; then
    echo "❌ Backend server is not running at http://localhost:3001"
    echo "Please start the backend server first:"
    echo "  cd ../nestjs-gallery-api"
    echo "  npm run start:dev"
    exit 1
fi

# Generate types from running backend
echo "📋 Generating types from running backend..."
npx openapi-typescript http://localhost:3001/api-json -o src/types/api.ts

echo "✅ API types updated successfully!"
echo "📁 Updated file: src/types/api.ts"
echo ""
echo "💡 You can now use the fully typed API client:"
echo "   import { typedApi } from '@/lib/api-typed'"
echo ""
echo "🔍 Check the example component:"
echo "   src/components/examples/TypedApiExample.tsx"
