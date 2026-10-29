module.exports = {
  apps: [
    {
      name: "mediareach-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "1G",
    },
    {
      name: "mediareach-sync-worker",
      script: "scripts/auto-sync-worker.js",
      autorestart: true,
      restart_delay: 5000,
    },
  ],
};

