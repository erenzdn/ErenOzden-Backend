/**
 * PM2 Ecosystem Configuration
 * Strapi Production Deployment
 * 
 * Kullanım:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 restart strapi-backend
 *   pm2 logs strapi-backend
 */

module.exports = {
  apps: [
    {
      name: 'strapi-backend',
      cwd: '/var/www/strapi',
      script: 'npm',
      args: 'run start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      env: {
        NODE_ENV: 'development',
        PORT: 1338,
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 1338,
      },

      error_file: '/var/log/pm2/strapi-error.log',
      out_file: '/var/log/pm2/strapi-out.log',
      log_file: '/var/log/pm2/strapi-combined.log',
      time: true,
      
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 50000,
      
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};
