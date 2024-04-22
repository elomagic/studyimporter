// Add hardcoded meta data provider for color images
import logger from 'electron-log/renderer';

export default function hardcodedMetaDataProvider(
  type: string,
  imageId: string,
  imageIds: any[],
): any {
  logger.info(`hardcodedMetaDataProvider(type=${type}, imageId=${imageId})`);

  if (type === 'imagePixelModule') {
    return {
      pixelRepresentation: 0,
      bitsAllocated: 24,
      bitsStored: 24,
      highBit: 24,
      photometricInterpretation: 'RGB',
      samplesPerPixel: 3,
    };
  }

  if (type === 'generalSeriesModule') {
    const url = new URL(imageId);
    return {
      modality: url.searchParams.get('modality') ?? 'OT',
      seriesNumber: 1,
      seriesDescription: 'Color',
      seriesDate: '20190201',
      seriesTime: '120000',
      seriesInstanceUID: url.searchParams.get('seriesInstanceUid'),
    };
  }

  if (type === 'imagePlaneModule') {
    const index = imageIds.indexOf(imageId);
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
  }

  if (type === 'voiLutModule') {
    return {
      // According to the DICOM standard, the width is the number of samples
      // in the input, so 256 samples.
      windowWidth: [256],
      // The center is offset by 0.5 to allow for an integer value for even
      // sample counts
      windowCenter: [128],
    };
  }

  if (type === 'modalityLutModule') {
    return {
      rescaleSlope: 1,
      rescaleIntercept: 0,
    };
  }

  return undefined;
}
