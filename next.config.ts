import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'yksehgfsltzngnhqrdiv.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**', // หรือใช้ '/**' เพื่ออนุญาตทุกอย่างใน host นี้
        },
        // แถมอันนี้เผื่อไว้สำหรับ Signed URL ที่คุณใช้อยู่
        {
          protocol: 'https',
          hostname: 'yksehgfsltzngnhqrdiv.supabase.co',
          port: '',
          pathname: '/storage/v1/object/sign/**',
        },
      ],
    },
};

export default nextConfig;
