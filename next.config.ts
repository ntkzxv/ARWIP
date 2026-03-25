// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ypmsrjhflwpdmfrqgupa.supabase.co', // Host จาก Error ล่าสุดของคุณ
        pathname: '/storage/v1/object/**',
      },
    ],
  },
};
export default nextConfig;