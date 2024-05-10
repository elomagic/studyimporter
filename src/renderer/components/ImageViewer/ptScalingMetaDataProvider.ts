import { utilities as csUtils } from '@cornerstonejs/core';

const scalingPerImageId: any = {};

// eslint-disable-next-line consistent-return
function get(type: string, imageId: string) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export default { get };
