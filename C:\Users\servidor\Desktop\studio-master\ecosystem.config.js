
module.exports = {
  apps : [
    {
      name   : "medistock-app",
      interpreter : "C:\\Program Files\\nodejs\\node.exe", // Ensure this is your Node.js path
      script    : "C:\\Users\\servidor\\Desktop\\studio-master\\node_modules\\next\\dist\\bin\\next",
      args      : "dev --turbopack -p 9002", // Cambiado a modo desarrollo y puerto 9002
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
      watch     : ["src", "public", "components.json", "next.config.ts", "tailwind.config.ts", "tsconfig.json"], // Archivos/carpetas a vigilar
      ignore_watch : ["node_modules", ".next", "src/lib/data"], // Archivos/carpetas a ignorar
      env       : {
        NODE_ENV: "development", // Especificar entorno de desarrollo
      },
      exec_mode : "fork",
      interpreter_args: []
    },
    {
      name      : "medistock-tunnel",
      interpreter : "C:\\Program Files\\nodejs\\node.exe", // Explicitly use Node.js
      script    : "C:\\Users\\servidor\\AppData\\Roaming\\npm\\node_modules\\localtunnel\\bin\\lt.js", // Direct path to localtunnel's JS file
      args      : ["--port", "9002"], // Arguments for lt.js, pointing to port 9002
      watch     : false,
      autorestart: true,
      restart_delay: 5000,
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master", // Not strictly necessary for lt, but good for consistency
      env       : {
        NODE_ENV: "production", // or development
      }
    }
  ]
}
