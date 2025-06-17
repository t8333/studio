
module.exports = {
  apps : [
    {
      name   : "medistock-app",
      // Ruta absoluta al ejecutable de node.
      interpreter : "C:\\Program Files\\nodejs\\node.exe",
      // Ruta absoluta al script de la CLI de Next.js dentro de tu proyecto
      script    : "C:\\Users\\servidor\\Desktop\\studio-master\\node_modules\\next\\dist\\bin\\next",
      args      : "start", // El comando para el script de Next.js (asume puerto 3000 por defecto)
      // Establecer el directorio de trabajo explícitamente a la raíz del proyecto
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
      watch     : false,
      env       : {
        NODE_ENV: "production",
      },
      exec_mode : "fork",
      interpreter_args: []
    },
    {
      name      : "medistock-tunnel",
      script    : "lt", // Comando de localtunnel (asume instalación global)
      args      : "--port 3000", // Apunta al puerto donde corre medistock-app
      watch     : false,
      autorestart: true, // Reinicia si falla
      restart_delay: 5000, // Espera 5 segundos antes de reiniciar
      env       : {
        NODE_ENV: "production",
      }
    }
  ]
}
