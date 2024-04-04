import { utilities as csUtils } from '@cornerstonejs/core';

const scalingPerImageId = {};

function get(type, imageId: string) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export default { get };
