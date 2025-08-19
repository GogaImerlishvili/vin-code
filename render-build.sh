#!/bin/bash
# Render.com build script

echo "🚀 Starting Render.com build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Set production environment
export NODE_ENV=production

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

# Test puppeteer in production mode
echo "🧪 Testing Puppeteer in production mode..."
node -e "
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');

async function testPuppeteer() {
  try {
    console.log('Testing @sparticuz/chromium...');
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    console.log('✅ Puppeteer production test successful!');
    await browser.close();
  } catch (error) {
    console.log('❌ Puppeteer production test failed:', error.message);
    process.exit(1);
  }
}

testPuppeteer();
"

echo "🎉 All tests passed! Ready for Render.com deployment."
