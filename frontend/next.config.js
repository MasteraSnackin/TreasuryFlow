/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_TREASURY_VAULT_ADDRESS: process.env.NEXT_PUBLIC_TREASURY_VAULT_ADDRESS,
    NEXT_PUBLIC_AUTO_SWAP_ADDRESS: process.env.NEXT_PUBLIC_AUTO_SWAP_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_EURC_ADDRESS: process.env.NEXT_PUBLIC_EURC_ADDRESS,
    NEXT_PUBLIC_CIRCLE_APP_ID: process.env.NEXT_PUBLIC_CIRCLE_APP_ID,
    NEXT_PUBLIC_ARC_TESTNET_RPC_URL: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL,
  },
};

module.exports = nextConfig;