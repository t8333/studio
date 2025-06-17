
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
      script    : "C:\\Users\\servidor\\AppData\\Roaming\\npm\\lt.cmd", // Ruta completa a lt.cmd
      args      : "--port 3000", // Apunta al puerto donde corre medistock-app
      watch     : false, // No es necesario observar cambios en localtunnel
      autorestart: true, // Reinicia si falla
      restart_delay: 5000, // Espera 5 segundos antes de reiniciar
      // NO se especifica 'interpreter' aquí, para que PM2 trate de ejecutar el .cmd directamente.
      // El propio archivo .cmd llamará a node.
      env       : {
        NODE_ENV: "production", // Opcional para localtunnel, pero no hace daño
      }
    }
  ]
}
