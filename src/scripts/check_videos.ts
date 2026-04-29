
import axios from 'axios';

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
      const response = await axios.head(url);
      console.log(`[${id}] Status: ${response.status} - ${response.status === 200 ? 'VALID' : 'FAIL'}`);
    } catch (error) {
      console.log(`[${id}] FAILED - ${error.message}`);
    }
  }
}

checkThumbnails();
