// using var to work around a WebKit bug



var map = new mapboxgl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm',
      }],
    }
    ,
    center: [-74.0060152, 40.7127281],
        zoom: 5,

  });
let pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);



pxRatio =  2;

var element =  document.getElementById('map');
const w = element.clientWidth * pxRatio;
const h = element.clientHeight * pxRatio;

var canvas = document.getElementById('canvas'); // eslint-disable-line
canvas.width = w;
canvas.height = h ;


const gl = canvas.getContext('webgl', {antialiasing: true});

const wind = window.wind = new WindGL(gl);
wind.numParticles = 65536;

function frame() {
    if (wind.windData) {
        wind.draw();
    }
    requestAnimationFrame(frame);
}
frame();

const gui = new dat.GUI();
gui.add(wind, 'numParticles', 1024, 589824);
gui.add(wind, 'fadeOpacity', 0.96, 0.999).step(0.001).updateDisplay();
gui.add(wind, 'speedFactor', 0.05, 1.0);
gui.add(wind, 'dropRate', 0, 0.1);
gui.add(wind, 'dropRateBump', 0, 0.2);

const windFiles = {
    0:  '2024042300',
    6:  '2024042306',
    12: '2024042312',
    18: '2024042318',
};

// const windFiles = {
//     0: '2016112000',
//     6: '2016112006',
//     12: '2016112012',
//     18: '2016112018',
//     24: '2016112100',
//     30: '2016112106',
//     36: '2016112112',
//     42: '2016112118',
//     48: '2016112200'
// };

const meta = {
    '2024-04-23+h': 0,
    'retina resolution': true,
    'github.com/mapbox/webgl-wind': function () {
        window.location = 'https://github.com/mapbox/webgl-wind';
    }
};
gui.add(meta, '2024-04-23+h', 0, 18, 6).onFinishChange(updateWind);
if (pxRatio !== 1) {
    gui.add(meta, 'retina resolution').onFinishChange(updateRetina);
}
gui.add(meta, 'github.com/mapbox/webgl-wind');
updateWind(0);
updateRetina();

function updateRetina() {
    const ratio = meta['retina resolution'] ? pxRatio : 1;
    console.log(ratio);
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    wind.resize();
}


// const url = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_coastline.geojson';
// //const url = 'wind/japan-adm-lv1.json';
// getJSON(url, function (data) {
//     const canvas = document.getElementById('coastline');
//     canvas.width = canvas.clientWidth * pxRatio;
//     canvas.height = canvas.clientHeight * pxRatio;

//     const ctx = canvas.getContext('2d');
//     ctx.lineWidth = pxRatio;
//     ctx.lineJoin = ctx.lineCap = 'round';
//     ctx.strokeStyle = 'white';
//     ctx.beginPath();

//     for (let i = 0; i < data.features.length; i++) {
//         const line = data.features[i].geometry.coordinates;
//         for (let j = 0; j < line.length; j++) {
//             ctx[j ? 'lineTo' : 'moveTo'](
//                 (line[j][0] + 180) * canvas.width / 360,
//                 (-line[j][1] + 90) * canvas.height / 180);
//         }
//     }
//     ctx.stroke();
// });

function updateWind(name) {
    getJSON('wind/' + windFiles[name] + '.json', function (windData) {
        const windImage = new Image();
        windData.image = windImage;
        windImage.src = 'wind/' + windFiles[name] + '.png';
        windImage.onload = function () {
            wind.setWind(windData);

        };
    });
}

function getJSON(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('get', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.response);
        } else {
            throw new Error(xhr.statusText);
        }
    };
    xhr.send();
}

map.on('load', () => {
    map.addSource('canvas-source', {
        type: 'canvas',
        canvas: 'canvas',
        coordinates: [

          // [
          //   -180.0 / 4, 
          //   85.0 / 4
          // ],
          // [
          //   180.0 / 4,
          //   85.0 / 4
          // ],
          // [
          //   180.0 / 4,
          //   -85.0 / 4
          // ],
          // [
          //  -180.0 / 4, 
          //   -85.0 / 4
          // ]

          [
            -180.0, 
            85.0
          ],
          [
            180.0,
            85.0
          ],
          [
            180.0,
            -85.0
          ],
          [
           -180.0, 
            -85.0
          ]
        ],
        // Set to true if the canvas source is animated. If the canvas is static, animate should be set to false to improve performance.
        animate: true
    });

    map.addLayer({
        id: 'canvas-layer',
        type: 'raster',
        source: 'canvas-source'
    });
});

