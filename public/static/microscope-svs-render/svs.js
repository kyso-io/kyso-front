svs = {};
// svs.gcsBasePath = 'https://storage.googleapis.com/imagebox_test';
// svs.serverBasePath = 'https://imageboxv2-oxxe7c4jbq-uc.a.run.app/iiif';
svs.serverBasePath = 'http://localhost:8080/iiif';

svs.loadImage = async (urlInGCP) => {
  console.log(urlInGCP);
  // if (urlInGCP.substr(urlInGCP.length - 4, 4) === "ndpi") {
  // 	alert("NDPI Images not yet supported!")
  // 	return
  // }
  urlInGCP = urlInGCP.replace(/\s/g, '_');
  const format = urlInGCP.endsWith('.ndpi') ? 'ndpi' : 'svs';
  const p = `${svs.serverBasePath}/?iiif=${urlInGCP}`;
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

  // const infoTable = document.getElementById("infoTable")
  // infoTable.innerHTML = ""
  // infoTable.style.width = '20%'
  // infoTable.style.border = "1px solid black"
  // infoTable.style.textAlign = "center"
  // document.getElementById("imageInfo").appendChild(infoTable)
  // Object.entries(imageInfo).forEach(([key, val]) => {
  // 	if (!key.trim().startsWith("@")) {
  // 		key = key.slice(0, 1).toUpperCase() + key.slice(1)
  // 		infoTable.innerHTML += `<tr><td>\n${key}</td><td>${val}</td></tr>`
  // 	}
  // })
  // infoTable.querySelectorAll("tr").forEach(el => {
  // 	el.style.border = "1px solid black"

  // 	el.querySelectorAll("td").forEach(el2 => el2.style.border = "1px solid black")
  // })

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
