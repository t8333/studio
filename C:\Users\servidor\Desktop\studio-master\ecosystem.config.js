
module.exports = {
  apps : [
    {
      name   : "medistock-app",
      interpreter : "C:\\Program Files\\nodejs\\node.exe",
      script    : "C:\\Users\\servidor\\Desktop\\studio-master\\node_modules\\next\\dist\\bin\\next",
      args      : "dev -p 9002",
      cwd       : "C:\\Users\\servidor\\Desktop\\studio-master",
      watch     : ["src", "public", "components.json", "next.config.ts", "tailwind.config.ts", "tsconfig.json"],
      ignore_watch : ["node_modules", ".next", "src/lib/data"],
      env       : {
        NODE_ENV: "development",
      },
      exec_mode : "fork",
      windowsHide: true, // <--- AÑADIDO ESTO
      interpreter_args: []
    }
  ]
}
