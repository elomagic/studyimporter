/**
 * Convert array buffer to image. Returns a promise that resolves to an Image object for the bytes in arrayBuffer
 *
 * @param arrayBuffer - arrayBuffer with bytes for a web image (e.g. JPEG, PNG, etc)
 * @returns {Promise} Promise that resolves to an Image object
 */

const arrayBufferToImage = (
  arrayBuffer: Iterable<number>,
): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const arrayBufferView = new Uint8Array(arrayBuffer);
    const blob = new Blob([arrayBufferView]);
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);

    image.src = imageUrl;
    image.onload = () => {
      resolve(image);
      urlCreator.revokeObjectURL(imageUrl);
    };

    image.onerror = (error) => {
      urlCreator.revokeObjectURL(imageUrl);
      reject(error);
    };
  });
};

export default arrayBufferToImage;
