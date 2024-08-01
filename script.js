const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const cameraBtn = document.getElementById('cameraBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

const bwFilter = document.getElementById('bwFilter');
const vintageFilter = document.getElementById('vintageFilter');
const sketchFilter = document.getElementById('sketchFilter');
const pixelateFilter = document.getElementById('pixelateFilter');

let originalImage = null;

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    loadImage(file);
});

cameraBtn.addEventListener('click', () => {
    // This will open the camera on supported devices
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            ctx.drawImage(originalImage, 0, 0);
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

bwFilter.addEventListener('click', () => applyFilter('bw'));
vintageFilter.addEventListener('click', () => applyFilter('vintage'));
sketchFilter.addEventListener('click', () => applyFilter('sketch'));
pixelateFilter.addEventListener('click', () => applyFilter('pixelate'));

function applyFilter(filterType) {
    if (!originalImage) return;

    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filterType) {
        case 'bw':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }
            break;
        case 'vintage':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i] * 0.9;
                data[i + 1] = data[i + 1] * 0.7;
                data[i + 2] = data[i + 2] * 0.5;
            }
            break;
        case 'sketch':
            // This is a simple edge detection filter
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const leftIdx = (y * canvas.width + (x - 1)) * 4;
                    const topIdx = ((y - 1) * canvas.width + x) * 4;
                    
                    const edge = Math.abs(data[idx] - data[leftIdx]) +
                                 Math.abs(data[idx] - data[topIdx]);
                    
                    data[idx] = data[idx + 1] = data[idx + 2] = 255 - edge;
                }
            }
            break;
        case 'pixelate':
            const pixelSize = 10;
            for (let y = 0; y < canvas.height; y += pixelSize) {
                for (let x = 0; x < canvas.width; x += pixelSize) {
                    const idx = (y * canvas.width + x) * 4;
                    const red = data[idx];
                    const green = data[idx + 1];
                    const blue = data[idx + 2];

                    for (let py = 0; py < pixelSize && y + py < canvas.height; py++) {
                        for (let px = 0; px < pixelSize && x + px < canvas.width; px++) {
                            const pixelIdx = ((y + py) * canvas.width + (x + px)) * 4;
                            data[pixelIdx] = red;
                            data[pixelIdx + 1] = green;
                            data[pixelIdx + 2] = blue;
                        }
                    }
                }
            }
            break;
    }

    ctx.putImageData(imageData, 0, 0);
}

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = canvas.toDataURL();
    link.click();
});