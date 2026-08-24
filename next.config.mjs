/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://175.123.138.168:8020/api/v1/:path*', // agent 서버 위치 ip 설정
      },
    ];
  },
};

export default nextConfig;
