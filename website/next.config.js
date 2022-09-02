/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://defichain.com", // Matched parameters can be used in the destination
        permanent: true,
      },
    ];
  },
};
