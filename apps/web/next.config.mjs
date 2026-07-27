// Disable Next.js anonymous build telemetry (privacy-first, before Next loads it).
process.env.NEXT_TELEMETRY_DISABLED = '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — deployable to any static host, no server runtime/logging.
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // No analytics, no redirects to third parties, no external scripts.
};

export default nextConfig;
