// Shared image utility functions
// Prevents code duplication across ProfileScreen, ShopkeeperProfile, ShopkeeperDashboard

/**
 * Get MIME type based on file extension
 * @param {string} fileName - The file name with extension
 * @returns {string} MIME type string
 */
export const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};
