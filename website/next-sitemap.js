module.exports = {
  siteUrl: process.env.SITE_URL || 'https://wallet.defichain.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{
      userAgent: '*',
      allow: '/',
    }]
  }
}
