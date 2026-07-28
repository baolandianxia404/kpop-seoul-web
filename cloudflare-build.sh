#!/bin/bash
set -e
echo "Building static export..."
npx next build
echo "Build complete! Output in ./out"
