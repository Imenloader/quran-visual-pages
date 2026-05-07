


const videoIds = [
  'YRhFSWz_J3I', // Pushups
  'eGo4IYlbE5g', // Pullups
  '6kALZikcCdM', // Dips
  '0kP0rP0r57s', // Squats
  'QOVaHwm-Q6U', // Lunges
  'pYcpY20QaE8', // Plank
  'fB8vL0-Yq_U', // Burpees
  'nmwgirg-V60'  // Mountain Climbers
];

async function checkThumbnails() {
  console.log('Checking Video Thumbnails...');
  for (const id of videoIds) {
    try {
      const url = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`[${id}] Status: ${response.status} - ${response.ok ? 'VALID' : 'FAIL'}`);
    } catch (error: any) {
      console.log(`[${id}] FAILED - ${error.message}`);
    }
  }
}

checkThumbnails();
