
module.exports = {
  apps : [
    {
      name   : "medistock-app",
      interpreter : "C:\\Program Files\\nodejs\\node.exe",
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
      script    : "C:\\Windows\\System32\\cmd.exe",
      args      : ["/c", "C:\\Users\\servidor\\AppData\\Roaming\\npm\\lt.cmd", "--port", "9002"], // Puerto cambiado a 9002
      watch     : false,
      autorestart: true,
      restart_delay: 5000,
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
      env       : {
        NODE_ENV: "production",
      }
    }
  ]
}
