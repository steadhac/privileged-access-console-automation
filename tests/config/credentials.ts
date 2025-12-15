/**
 * Credentials Configuration
 * Centralized credential management - reads from .env
 */

export const credentials = {
  // Guacamole Credentials (Apache Guacamole - Privileged Access)
  guacamole: {
    url: process.env.GUACAMOLE_URL || 'http://localhost:8080/guacamole',
    admin: {
      username: process.env.GUACAMOLE_ADMIN_USERNAME || 'guacadmin',
      password: process.env.GUACAMOLE_ADMIN_PASSWORD || 'guacadmin'
    }
  },

  // OrangeHRM Credentials (Legacy - keeping for reference)
  orangeHRM: {
    url: process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com/',
    admin: {
      username: process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
      password: process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123'
    },
    ess:{
      username: process.env.ORANGEHRM_ESS_USERNAME || 'stead',
      password: process.env.ORANGEHRM_ESS_PASSWORD || 'steadhac123' 
    },
  },

  // The Internet Herokuapp
  theInternet: {
    url: process.env.BASE_URL || 'https://the-internet.herokuapp.com',
    validUser: {
      username: process.env.ADMIN_USERNAME || 'tomsmith',
      password: process.env.ADMIN_PASSWORD || 'SuperSecretPassword!',
    },
  },
};