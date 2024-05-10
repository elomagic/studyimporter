import logger from 'electron-log';
import { imageLoader } from '@cornerstonejs/core';
import arrayBufferToImage from './array-buffer-to-image';

export const IMAGE_LOADER_SCHEMA = 'elosi';

const canvas: HTMLCanvasElement = document.createElement('canvas');
let lastImageIdDrawn: string;

/**
 * creates a cornerstone Image object for the specified Image and imageId
 *
 * @param image - An Image
 * @param imageId - the imageId for this image
 * @returns Cornerstone Image Object
 */
export function createImage(image: HTMLImageElement, imageId: string) {
  // extract the attributes we need
  const rows = image.naturalHeight;
  const columns = image.naturalWidth;

  function getImageData() {
    let context: CanvasRenderingContext2D | null;

    if (lastImageIdDrawn === imageId) {
      context = canvas.getContext('2d');
    } else {
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      context = canvas.getContext('2d');

      if (context === null) {
        throw new Error('Context from image loader must not be null.');
      } else {
        context.drawImage(image, 0, 0);
      }
      lastImageIdDrawn = imageId;
    }

    if (context === null) {
      throw new Error('Context from image loader must not be null.');
    }

    return context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
  }

  function getPixelData() {
    const imageData = getImageData();

    return imageData.data;
  }

  function getCanvas() {
    if (lastImageIdDrawn === imageId) {
      return canvas;
    }

    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    const context = canvas.getContext('2d');

    if (context === null) {
      throw new Error('Context from image loader must not be null.');
    }

    context.drawImage(image, 0, 0);
    lastImageIdDrawn = imageId;

    return canvas;
  }

  // Extract the various attributes we need
  return {
    imageId,
    minPixelValue: 0,
    maxPixelValue: 255,
    slope: 1,
    intercept: 0,
    windowCenter: 128,
    windowWidth: 255,
    getPixelData,
    getCanvas,
    getImage: () => image,
    rows,
    columns,
    height: rows,
    width: columns,
    color: true,
    rgba: false,
    columnPixelSpacing: 1,
    rowPixelSpacing: 1,
    invert: false,
    sizeInBytes: rows * columns * 3,
  };
}

/**
 * Loads a DICOM image.
 *
 * @param imageId URI of pattern "elosi://?serieInstanceUid=1.2&file=1.dcm"
 */
export function loadImage(imageId: string): {
  promise: Promise<Record<string, any>>;
  cancelFn: () => void;
} {
  const url = new URL(imageId);
  const serieInstanceUid: string =
    url.searchParams.get('seriesInstanceUid') ?? '';
  const dicomFile: string = url.searchParams.get('file') ?? '';

  const promise: Promise<Record<string, any>> = new Promise(
    (resolve, reject) => {
      logger.info(`Loading image ${dicomFile}`);
      window.electron.ipcRenderer
        .getDicomImage(serieInstanceUid, dicomFile)
        .then((buffer: Iterable<number>) => {
          return arrayBufferToImage(buffer);
        })
        .then((image: HTMLImageElement) => {
          const imageObject = createImage(image, imageId);
          resolve(imageObject);
          return image;
        })
        .catch((e: Error) => {
          logger.error(e.message);
          reject(e);
        });
    },
  );

  const cancelFn = () => {
    // noop
  };

  return {
    promise,
    cancelFn,
  };
}

export default function initImageLoader() {
  // Register custom image loader
  imageLoader.registerImageLoader(IMAGE_LOADER_SCHEMA, loadImage);
}
