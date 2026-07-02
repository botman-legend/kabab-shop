// next.config.js
module.exports = {
  async rewrites() {
    return [
      // Proxy backend routes to Railway
      {
        source: '/api/cart/:path*',
        destination: 'https://botman-production.up.railway.app/cart/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'https://botman-production.up.railway.app/orders/:path*',
      },
      {
        source: '/api/chat-bot/:path*',
        destination: 'https://botman-production.up.railway.app/chat-bot/:path*',
      },
      // DO NOT rewrite /api/auth/*
    ];
  },

  images: {
    domains: [
      "elfarblobprod.blob.core.windows.net", // ✅ blob storage domain for product images
      "https://img.freepik.com/premium-photo/thinking-robot-white-humanoid-robot"
    ],
  },
};
