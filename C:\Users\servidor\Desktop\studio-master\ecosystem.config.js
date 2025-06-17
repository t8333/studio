module.exports = {
  apps : [{
    name   : "medistock-app",        // El nombre que quieres para tu app en PM2
    script : "node",                 // Ejecuta 'node' directamente
    args   : "node_modules/next/dist/bin/next start", // Argumentos para 'node': el script de la CLI de Next y el comando 'start'
    cwd    : __dirname,              // Establece el directorio de trabajo actual al del proyecto
    watch  : false,
    env    : {
      NODE_ENV: "production",        // Variable de entorno para modo producción
    }
  }]
}
