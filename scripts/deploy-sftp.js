const path = require('path');
const fs = require('fs');
const SftpClient = require('ssh2-sftp-client');
require('dotenv').config();

// Configuration validation
const requiredEnv = ['SFTP_HOST', 'SFTP_PORT', 'SFTP_USER', 'SFTP_KEY_PATH', 'SFTP_REMOTE_PATH'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('\x1b[31m[Error] Missing required environment variables in .env:\x1b[0m');
  missingEnv.forEach(key => console.error(`  - ${key}`));
  console.log('\nPlease configure these in your local .env file.');
  process.exit(1);
}

const config = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT, 10) || 22,
  username: process.env.SFTP_USER,
  remotePath: process.env.SFTP_REMOTE_PATH,
  keyPath: path.resolve(process.env.SFTP_KEY_PATH)
};

// Check if private key file exists
if (!fs.existsSync(config.keyPath)) {
  console.error(`\x1b[31m[Error] Private key file not found at path: ${config.keyPath}\x1b[0m`);
  process.exit(1);
}

const localBuildPath = path.resolve(__dirname, '../dist/spiritual-imagination/browser');

// Check if local build directory exists
if (!fs.existsSync(localBuildPath)) {
  console.error(`\x1b[31m[Error] Build directory not found at: ${localBuildPath}\x1b[0m`);
  console.error('Please run "npm run build" first to generate the distribution files.');
  process.exit(1);
}

async function main() {
  const sftp = new SftpClient();
  
  console.log(`\x1b[36m[SFTP] Connecting to ${config.host}:${config.port} as ${config.username}...\x1b[0m`);
  
  try {
    const privateKey = fs.readFileSync(config.keyPath);
    
    await sftp.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey: privateKey,
      // ssh2-sftp-client handles standard PPK keys directly
      readyTimeout: 20000
    });
    
    console.log('\x1b[32m[SFTP] Connected successfully! Starting file upload...\x1b[0m');
    console.log(`[SFTP] Uploading from: ${localBuildPath}`);
    console.log(`[SFTP] Uploading to:   ${config.remotePath}`);
    
    // Ensure remote path directory exists (creates if not present)
    const remoteExists = await sftp.exists(config.remotePath);
    if (!remoteExists) {
      console.log(`[SFTP] Remote directory doesn't exist. Creating directory: ${config.remotePath}`);
      await sftp.mkdir(config.remotePath, true);
    }
    
    // Upload the build directory
    // uploadDir returns details about the files uploaded
    const result = await sftp.uploadDir(localBuildPath, config.remotePath);
    
    console.log(`\x1b[32m[SFTP] Upload completed successfully! ${result}\x1b[0m`);
    
  } catch (err) {
    console.error('\x1b[31m[SFTP Error] Deployment failed:\x1b[0m');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await sftp.end();
    console.log('[SFTP] Connection closed.');
  }
}

main();
