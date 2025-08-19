# MYAUTOVIN.ge - VIN Checker Application

Car VIN checking application with Carfax and AutoCheck integration, deployed on Vercel.

## Deployment on Vercel

### Prerequisites
1. Vercel account
2. GitHub repository connected to Vercel
3. Domain `myautovin.ge` configured

### Environment Variables Setup

Copy all variables from `.env.vercel` to your Vercel project:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable from `.env.vercel`

**Required Variables:**
- `API_URL`
- `API_KEY`
- `NEXT_PUBLIC_AUTOCHECK_PRICE`
- `NEXT_PUBLIC_CARFAX_PRICE`
- `BOG_CLIENT_ID`
- `BOG_CLIENT_SECRET`
- `BOG_API_URL`
- `BOG_CALLBACK_URL`
- `BOG_RETURN_URL`
- `BOG_FAIL_URL`
- `BOG_SUCCESS_URL`
- `SENDGRID_API_KEY`
- `FIRESTORE_MAIL`
- `FIRESTORE_PASSWORD`
- `NODE_ENV=production`

### Domain Configuration

1. In Vercel Dashboard > Settings > Domains
2. Add custom domain: `myautovin.ge`
3. Configure DNS records as instructed by Vercel

### Features

- **VIN Validation**: Client and server-side VIN code validation
- **Carfax Integration**: Fetch vehicle reports from Carfax
- **AutoCheck Integration**: Alternative vehicle history reports
- **PDF Generation**: Server-side PDF generation with Puppeteer
- **Payment Processing**: BOG (Bank of Georgia) payment integration
- **Email Notifications**: SendGrid integration for email delivery
- **Admin Panel**: Manage pending emails and orders

### API Endpoints

- `/api/car-info` - Get vehicle information by VIN
- `/api/checkout` - Process payment requests
- `/api/webhook` - Handle payment confirmations
- `/api/test-autocheck` - Test AutoCheck API integration
- `/api/admin/pending-emails` - Admin panel for email management

### Technical Stack

- **Framework**: Next.js 13.4.8
- **Deployment**: Vercel
- **PDF Generation**: Puppeteer + @sparticuz/chromium
- **Payments**: BOG API
- **Email**: SendGrid
- **Database**: Firestore
- **Styling**: Tailwind CSS + Chakra UI

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

### Environment Notes

- **Development**: Uses local Chrome for Puppeteer
- **Production (Vercel)**: Uses @sparticuz/chromium for serverless environment
- **Images**: Carfax logo extraction with multiple fallback strategies
- **Function Timeout**: 30 seconds for API routes (configured in vercel.json)
