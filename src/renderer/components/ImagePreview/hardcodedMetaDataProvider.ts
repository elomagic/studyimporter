// Add hardcoded meta data provider for color images
import logger from 'electron-log/renderer';

export default function hardcodedMetaDataProvider(
  type: string,
  imageId: string,
  imageIds: any[],
): any {
  const colonIndex = imageId.indexOf(':');
  const scheme = imageId.substring(0, colonIndex);
  logger.info(`hardcodedMetaDataProvider(type=${type}, imageId=${imageId})`);

  if (scheme !== 'web') {
    return;
  }

  if (type === 'imagePixelModule') {
    return {
      pixelRepresentation: 0,
      bitsAllocated: 24,
      bitsStored: 24,
      highBit: 24,
      photometricInterpretation: 'RGB',
      samplesPerPixel: 3,
    };
  } else if (type === 'generalSeriesModule') {
    return {
      modality: 'SC',
      seriesNumber: 1,
      seriesDescription: 'Color',
      seriesDate: '20190201',
      seriesTime: '120000',
      seriesInstanceUID: '1.2.276.0.7230010.3.1.4.83233.20190201120000.1',
    };
  } else if (type === 'imagePlaneModule') {
    const index = imageIds.indexOf(imageId);
    // console.warn(index);
    return {
      imageOrientationPatient: [1, 0, 0, 0, 1, 0],
      imagePositionPatient: [0, 0, index * 5],
      pixelSpacing: [1, 1],
      columnPixelSpacing: 1,
      rowPixelSpacing: 1,
      frameOfReferenceUID: 'FORUID',
      columns: 2048,
      rows: 1216,
      rowCosines: [1, 0, 0],
      columnCosines: [0, 1, 0],
    };
  } else if (type === 'voiLutModule') {
    return {
      // According to the DICOM standard, the width is the number of samples
      // in the input, so 256 samples.
      windowWidth: [256],
      // The center is offset by 0.5 to allow for an integer value for even
      // sample counts
      windowCenter: [128],
    };
  } else if (type === 'modalityLutModule') {
    return {
      rescaleSlope: 1,
      rescaleIntercept: 0,
    };
  }
  return undefined;
}
