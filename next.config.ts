/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ypmsrjhflwpdmfrqgupa.supabase.co', // Hostname จาก Error ของคุณ
        port: '',
        pathname: '/storage/v1/object/**', // อนุญาตทุกอย่างใน Storage
      },
    ],
  },
};

export default nextConfig;