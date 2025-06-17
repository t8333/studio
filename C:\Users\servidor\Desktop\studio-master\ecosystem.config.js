
module.exports = {
  apps : [{
    name   : "medistock-app",
    // Ruta absoluta al ejecutable de node. Reemplaza si 'where node' te dio una ruta diferente.
    interpreter : "C:\\Program Files\\nodejs\\node.exe",
    // Ruta absoluta al script de la CLI de Next.js dentro de tu proyecto
    script    : "C:\\Users\\servidor\\Desktop\\studio-master\\node_modules\\next\\dist\\bin\\next",
    args      : "start", // El comando para el script de Next.js
    // Establecer el directorio de trabajo explícitamente a la raíz del proyecto
    cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
    watch     : false,
    env       : {
      NODE_ENV: "production",
    },
    // Configuración adicional para asegurar que se usa el intérprete especificado
    exec_mode : "fork",
    interpreter_args: [] // No se necesitan argumentos adicionales para el intérprete en este caso
  }]
}
