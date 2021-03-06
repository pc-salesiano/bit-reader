var pixelsize = 1
// convert 0..255 R,G,B values to a hexidecimal color string
RGBToHex = function (r, g, b) {
    var bin = r << 16 | g << 8 | b;
    return (function (h) {
        return new Array(7 - h.length).join("0") + h
    })(bin.toString(16).toUpperCase())
}

// convert a 24 bit binary color to 0..255 R,G,B
binToRGB = function (bin) {
    var pbin = parseInt(bin, 2);
    var r = pbin >> 16;
    var g = pbin >> 8 & 0xFF;
    var b = pbin & 0xFF;
    return [r, g, b];
}

// convert a hexidecimal color string to 0..255 R,G,B
hexToRGB = function (hex) {
    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r, g, b];
}
function create_image() {
    document.getElementById("loading").style.display = 'flex';
    var bin = document.getElementById("image").value;
    let linhas = bin.split("\n")
    canvas = document.getElementById('myCanvas')
    canvasContext = canvas.getContext('2d')
    var i, j = 0
    linhas.forEach(element => {
        colunas = element.split(',')
        colunas.pop()
        i = 0
        colunas.forEach(ef => {
            arr = binToRGB(ef)
            let r = arr[0]
            let g = arr[1]
            let b = arr[2]
            canvasContext.fillStyle = '#' + RGBToHex(r, g, b)
            canvasContext.fillRect(i * pixelsize, j * pixelsize, pixelsize, pixelsize)
            i++
        });
        j++
    });
    document.getElementById("loading").style.display = 'none';
}


// Check for the File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    document.querySelector('#file-js input[type=file]').addEventListener('change', convertDataURIToBinary, false);

} else {
    // alert('The File APIs are not fully supported in this browser.');
}

document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .del') || []).forEach(($delete) => {
      var $notification = $delete.parentNode;
  
      $delete.addEventListener('click', () => {
        $notification.parentNode.removeChild($notification);
      });
    });
  });
var b_str;
var u8Array;
var BASE64_MARKER;

function convertBase64ToPixelsArray(base64DataUrl, callback) {
    var mCanvas = document.createElement("canvas");
    var ctx = mCanvas.getContext("2d");
    var pixelsArray = [];
    var img = document.createElement("img");
    img.onload = getRGB;
    img.src = base64DataUrl;

    function getRGB() {
        mCanvas.width = img.width;
        mCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;
        for (var i = 0; i < data.length; i += 4) {
            pixelsArray.push([data[i], data[i + 1], data[i + 2]]);
        }
        callback(pixelsArray);
    }
}

function convertDataURIToBinary(evt) {
    document.getElementById("loading").style.display = 'flex';
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function (theFile) {
        return async function (e) {
            let b64 = await toBase64(theFile);
            let size = await getImageDimensions(b64);
            let a = convertBase64ToPixelsArray(b64, (arr) => {
                var binstr = ''
                var count = 0
                document.getElementById("progress").setAttribute('max', size.w);
                
                arr.forEach((pix) => {
                    var pixel = ''
                    pix.forEach((lay) => {
                        pixel += Number(lay).toString(2).padStart(8, '0')
                        
                    })
                   
                    binstr += pixel + ',';

                    count++;
                    if (count % size.w == 0) {
                        document.getElementById("progress").setAttribute('value', count/size.w);
                        binstr += '\n'
                    }
                })
                elemento = document.getElementById("image");
                elemento.innerHTML = binstr;
                document.getElementById("loading").style.display = 'none';
            });

        };
    })(f);
    reader.readAsBinaryString(f);


}

const chunk = (arr, n) => arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : []

function getImageDimensions(file) {
    return new Promise(function (resolved, rejected) {
        var i = new Image()
        i.onload = function () {
            resolved({ w: i.width, h: i.height })
        };
        i.src = file
    })
}



const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});