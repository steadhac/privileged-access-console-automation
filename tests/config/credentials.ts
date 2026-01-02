/**
 * Credentials Configuration
 * 
 * Reads from environment variables (.env file) with safe fallback defaults.
 * All default credentials are public/demo values - override in production via .env
 */

export const credentials = {
  // Apache Guacamole - Privileged Access Management
  guacamole: {
    url: process.env.GUACAMOLE_URL || 'http://localhost:8080/guacamole',
    admin: {
      username: process.env.GUACAMOLE_ADMIN_USERNAME || 'guacadmin',
      password: process.env.GUACAMOLE_ADMIN_PASSWORD || 'guacadmin'
    }
  },

  // OrangeHRM - Legacy (public demo site)
  orangeHRM: {
    url: process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com/',
    admin: {
      username: process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
      password: process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123'
    },
    ess: {
      username: process.env.ORANGEHRM_ESS_USERNAME || 'stead',
      password: process.env.ORANGEHRM_ESS_PASSWORD || 'steadhac123' 
    }
  },

  // The Internet Herokuapp - Testing Playground
  theInternet: {
    url: process.env.BASE_URL || 'https://the-internet.herokuapp.com',
    validUser: {
      username: process.env.ADMIN_USERNAME || 'tomsmith',
      password: process.env.ADMIN_PASSWORD || 'SuperSecretPassword!'
    }
  }
};