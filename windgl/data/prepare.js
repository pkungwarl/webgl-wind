const PNG = require('pngjs').PNG;
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('tmp.json'));
const name = process.argv[2];
const u = data.u.messages[0];
const v = data.v.messages[0];


const width = u.find(x => x.key == 'Ni').value;
const height = u.find(x => x.key == 'Nj').value - 1;

const png = new PNG({
    colorType: 2,
    filterType: 4,
    width: width,
    height: height
});

const uValues = u.find(x => x.key == 'values').value;
const vValues = v.find(x => x.key == 'values').value;

const uMinumum = u.find(x => x.key == 'minimum').value;
const vMinumum = v.find(x => x.key == 'minimum').value;

const uMaximum = u.find(x => x.key == 'maximum').value;
const vMaximum = v.find(x => x.key == 'maximum').value;

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const k = y * width + (x + width / 2) % width;



        png.data[i + 0] = Math.floor(255 * (uValues[k] - uMinumum) / (uMaximum - uMinumum));
        png.data[i + 1] = Math.floor(255 * (vValues[k] - vMinumum) / (vMaximum - vMinumum));
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
    }
}

png.pack().pipe(fs.createWriteStream(name + '.png'));
console.log('output: '+ name + '.png');

const uDataDate = u.find(x => x.key == 'dataDate').value;
const uDataTime = u.find(x => x.key == 'dataTime').value;
fs.writeFileSync(name + '.json', JSON.stringify({
    source: 'http://nomads.ncep.noaa.gov',
    date: formatDate(uDataDate + '', uDataTime),
    width: width,
    height: height,
    uMin: uMinumum,
    uMax: uMaximum,
    vMin: vMinumum,
    vMax: vMaximum
}, null, 2) + '\n');

console.log('output: '+ name + '.json');

function formatDate(date, time) {
    return date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2) + 'T' +
        (time < 10 ? '0' + time : time) + ':00Z';
}
