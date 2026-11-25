/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        //destination: 'http://175.123.138.168:8020/api/v1/:path*', // agent 서버 위치 ip 설정
        destination: 'http://127.0.0.1:8020/api/v1/:path*', // agent 서버 위치 ip 설정
        //destination: 'http://localhost:8020/api/v1/:path*', // agent 서버 위치 ip 설정
        // Error: socket hang up
        //   at Socket.socketCloseListener (node:_http_client:477:27)
        //   at Socket.emit (node:events:536:35)
        //   at TCP.<anonymous> (node:net:343:12)
        //   at TCP.callbackTrampoline (node:internal/async_hooks:130:17) {
        // code: 'ECONNRESET'
        // }
      },
    ];
  },
};

export default nextConfig;
