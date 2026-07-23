#!/bin/bash
set -e

echo "🚀 Building for Cloudflare Pages..."

# Temporarily move API route (static export doesn't support API routes)
if [ -d "src/app/api" ]; then
  echo "📦 Moving API route temporarily..."
  mv src/app/api src/app/api.cfbak
fi

# Build with static export
echo "🔨 Building static export..."
CF_BUILD=1 npx next build

# Restore API route
if [ -d "src/app/api.cfbak" ]; then
  echo "📦 Restoring API route..."
  mv src/app/api.cfbak src/app/api
fi

echo "✅ Cloudflare build complete! Output in ./out"
