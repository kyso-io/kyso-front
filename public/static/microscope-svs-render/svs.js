svs = {};
// svs.gcsBasePath = 'https://storage.googleapis.com/imagebox_test';
// svs.serverBasePath = 'https://imageboxv2-oxxe7c4jbq-uc.a.run.app/iiif';
svs.serverBasePath = 'http://localhost:8080/iiif';

svs.loadImage = async (file, fileSCS) => {
  console.log(file);
  console.log(fileSCS);

  file = file.replace(/\s/g, '_');
  const p = `${svs.serverBasePath}/?iiif=${fileSCS}`;
  const infoURL = `${p}/info.json`;
  let imageInfo;
  try {
    imageInfo = await (await fetch(infoURL)).json();
  } catch (e) {
    alert('An error occurred retrieving the image information. Please try again later.');
    // window.history.back()
    // setTimeout(() => {
    // 	document.getElementById("imageSelectName").value = hashParams.imageTag
    // 	document.getElementById("imageSelectId").value = hashParams.imageNslcId
    // }, 1000)
    document.getElementById('loadingText').style.display = 'none';
    return;
  }
  console.log('image Info : ', imageInfo);

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
      '@id': p,
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
  setTimeout(() => (document.getElementById('loadingText').style.display = 'none'), 5000);
};

if (typeof define != 'undefined') {
  define(svs);
}
