import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start Express server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`[Brainfy Server] Running on http://localhost:${PORT}`);
      console.log(`[Brainfy Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Brainfy Server] Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [Brainfy Server] Port ${PORT} is already in use.`);
        console.error(`   Run the following in PowerShell to free port ${PORT}:`);
        console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
        process.exit(1);
      } else {
        console.error('[Brainfy Server] Server error:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown on SIGTERM / SIGINT
    const handleShutdown = (signal) => {
      console.log(`[Brainfy Server] ${signal} signal received. Closing HTTP server...`);
      server.close(() => {
        console.log('[Brainfy Server] HTTP server closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('[Brainfy Server] Failed to initialize server:', err.message);
  });

