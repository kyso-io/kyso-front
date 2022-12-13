svs = {};
svs.serverBasePath = '/iiif';

svs.loadImage = async (file) => {
  const fileURL = `${svs.serverBasePath}/?format=svs&iiif=${file}`;
  const infoURL = `${fileURL}/info.json`;
  let imageInfo;
  try {
    imageInfo = await (await fetch(infoURL)).json();
  } catch (e) {
    /* eslint-disable no-alert */
    alert('An error occurred retrieving the image information. Please try again later.');
    return;
  }

  document.getElementById('openseadragon1').innerHTML = '';
  const viewer1 = OpenSeadragon({
    id: 'openseadragon1',
    preserveViewport: true,
    visibilityRatio: 1,
    minZoomLevel: 1,
    defaultZoomLevel: 1,
    prefixUrl: './openseadragon/images/',
    tileSources: {
      '@context': imageInfo['@context'],
      '@id': fileURL,
      height: parseInt(imageInfo.height),
      width: parseInt(imageInfo.width),
      profile: ['http://iiif.io/api/image/2/level2.json'],
      protocol: 'http://iiif.io/api/image',
      tiles: [
        {
          scaleFactors: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576],
          width: 256,
        },
      ],
    },
  });
};
if (typeof define != 'undefined') {
  define(svs);
}
