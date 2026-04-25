import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  blob?: Blob;
  fileName?: string;
}

export const shareContent = async (data: ShareData): Promise<boolean> => {
  const { title, text, url, blob, fileName = 'shared-ayah.png' } = data;

  try {
    if (Capacitor.isNativePlatform()) {
      let fileUrl: string | undefined;

      if (blob) {
        // On Android/iOS, we need to save the file to the filesystem first to share it
        const base64Data = await blobToBase64(blob);
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
        fileUrl = savedFile.uri;
      }

      await Share.share({
        title,
        text,
        url,
        files: fileUrl ? [fileUrl] : undefined,
      });
      return true;
    } else {
      // Web Implementation
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] })) {
        const file = new File([blob], fileName, { type: blob.type });
        await navigator.share({
          title,
          text,
          url,
          files: [file],
        });
        return true;
      } else if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        return true;
      } else {
        // Fallback: Download the file if it's a blob
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          link.click();
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          return true;
        }
        return false;
      }
    }
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      console.error('Sharing failed:', error);
      throw error;
    }
    return false;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data:image/png;base64, part
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
