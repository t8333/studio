
module.exports = {
  apps : [
    {
      name   : "medistock-app",
      interpreter : "C:\\Program Files\\nodejs\\node.exe",
      script    : "C:\\Users\\servidor\\Desktop\\studio-master\\node_modules\\next\\dist\\bin\\next",
      args      : "dev --turbopack -p 9002",
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
      watch     : ["src", "public", "components.json", "next.config.ts", "tailwind.config.ts", "tsconfig.json"],
      ignore_watch : ["node_modules", ".next", "src/lib/data"],
      env       : {
        NODE_ENV: "development",
      },
      exec_mode : "fork",
      interpreter_args: []
    },
    {
      name      : "medistock-tunnel",
      interpreter : "C:\\Program Files\\nodejs\\node.exe", // Use Node.js to run our wrapper script
      script    : "C:\\Users\\servidor\\Desktop\\studio-master\\start-localtunnel.js", // Path to our new wrapper script
      args      : [], // The wrapper script doesn't need arguments here
      watch     : false, // No need to watch this wrapper script for changes usually
      autorestart: true, // Restart if it crashes
      restart_delay: 5000, // Delay before restarting
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master", // Set CWD to project root
      env       : {
        NODE_ENV: "production", // Or development, doesn't matter much for this script
      }
    }
  ]
}
