
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
      script    : "C:\\Windows\\System32\\cmd.exe", // Usar cmd.exe como el script principal
      args      : ["/c", "C:\\Users\\servidor\\AppData\\Roaming\\npm\\lt.cmd", "--port", "3000"], // Argumentos para cmd.exe: /c para ejecutar y terminar, luego el comando lt
      watch     : false,
      autorestart: true,
      restart_delay: 5000,
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master", // Establecer CWD para el túnel también
      env       : {
        NODE_ENV: "production",
      }
    }
  ]
}
