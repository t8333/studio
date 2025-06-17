
// C:\Users\servidor\Desktop\studio-master\start-localtunnel.js
const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 9002 }); // Port your Next.js app (medistock-app) is running on

    console.log(`[localtunnel-wrapper] Tunnel created successfully. Your URL is: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('[localtunnel-wrapper] Tunnel closed');
      // PM2 will restart it based on autorestart: true
    });

    tunnel.on('error', (err) => {
      console.error('[localtunnel-wrapper] Tunnel error:', err);
      // Exit with an error code so PM2 knows it failed
      process.exit(1); 
    });

  } catch (err) {
    console.error('[localtunnel-wrapper] Failed to start localtunnel:', err);
    process.exit(1);
  }
})();
