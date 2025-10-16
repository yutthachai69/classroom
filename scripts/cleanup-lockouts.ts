import { cleanupExpiredLockouts } from '../lib/account-lockout';

async function main() {
  try {
    console.log('Starting cleanup of expired lockouts...');
    
    const cleanedCount = await cleanupExpiredLockouts();
    
    console.log(`Cleanup completed. ${cleanedCount} accounts unlocked.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  main();
}

export { main as cleanupExpiredLockouts };
