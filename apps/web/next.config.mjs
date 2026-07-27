// Disable Next.js anonymous build telemetry (privacy-first, before Next loads it).
process.env.NEXT_TELEMETRY_DISABLED = '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages are static; the contact form posts to a server route (/api/contact),
  // which forwards to Brevo. No analytics, no cookies, no external scripts.
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
