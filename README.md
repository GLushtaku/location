This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Quick Start (File System Storage - Default)

The app works out of the box! Just run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Data will be saved to `/data/locations.json` automatically.

### Using MongoDB (Optional - for deployment)

If you want to use MongoDB (required for Vercel/serverless deployment):

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get a free MongoDB database from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

3. Add your connection string to `.env.local`:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```

4. Restart the dev server

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
