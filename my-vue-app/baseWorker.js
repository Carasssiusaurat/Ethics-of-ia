// 
// baseWorker.js
// 

const stringToBase10 = (str) => {
    let base10 = '';

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        base10 += charCode;
    }

    return base10;
}

const getData = (audioFile, callback) => {
    var reader = new FileReader();

    reader.onload = function (event) {
        var data = event.target.result.split(',');
        var decodedImageData = btoa(data[1]);

        callback(stringToBase10(decodedImageData));
    };

    reader.readAsDataURL(audioFile);
}

self.addEventListener('message', function (e) {
    getData(e.data, (data) => {
        self.postMessage(data);
        self.close();
    });
}, false);
