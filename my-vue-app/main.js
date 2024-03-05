import './style.css'
import './bouton.css'

//
// Local Storage
// 

let songDataBase10 = "";
let pictureUrl = "";

let pictureDimensions = {
    x: 0,
    y: 0
};

let cellState = {
    dead: 0,
    alive: 1,
    none: 2
}

const deadColor = [255, 255, 255];

// 
// dataToArt
// 

const getCoord = (data, xSize) => {
    let xLen = xSize.length;
    let x = data.slice(0, xLen);

    if (x < xSize) {
        return x;
    }

    x = data.slice(0, xLen - 1);

    return x;
}

const getColorElement = (data) => {
    let element = data.slice(0, 3);

    if (element < 255) {
        return element;
    }

    element = data.slice(0, 2);

    return element;
}

const dataToArt = (data, xSize, ySize) => {
    let art = [];

    for (let i = 0; i < data.length;) {

        let x = getCoord(data, xSize);
        data = data.slice(x.length)
        i += x.length;

        let y = getCoord(data, ySize);
        data = data.slice(y.length)
        i += y.length;

        let r = getColorElement(data);
        data = data.slice(r.length)
        i += r.length;

        let g = getColorElement(data);
        data = data.slice(g.length)
        i += g.length;

        let b = getColorElement(data);
        data = data.slice(b.length)
        i += b.length;

        let element = {
            coord: [x, y],
            color: [r, g, b],
        }

        art.push(element);
    }

    return art;
}

// 
// Game of Life
// 

const createGrid = () => {
    let grid = [];

    for (let i = 0; i < pictureDimensions.x; i++) {
        let row = new Array(pictureDimensions.y).fill({
            state: cellState.none,
            color: deadColor
        });

        grid.push(row);
    }

    return grid;
}

const fillGrid = (grid, data) => {
    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        let x = element.coord[0];
        let y = element.coord[1];
        let color = element.color;

        // console.log("x : ", parseInt(x), ",y :", y, ", max x: ", pictureDimensions.x, ", max y: ", pictureDimensions.y);
        // console.log("line length: ", grid[parseInt(x)].length);

        grid[parseInt(x)][y] = {
            state: cellState.alive,
            color: color
        }
    }

    return grid;
}

const getNeighbors = (grid, x, y) => {
    let neighbors = [];

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) {
                continue;
            }

            let newX = x + i;
            let newY = y + j;

            if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
                neighbors.push(grid[newX][newY]);
            }
        }
    }

    return neighbors;
}

const gameLogic = (grid) => {
    let newGrid = createGrid();

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let cell = grid[i][j];
            let neighbors = getNeighbors(grid, i, j);
            let aliveNeighbors = neighbors.filter(neighbor => neighbor.state === cellState.alive);
            if (cell.state === cellState.alive) {
                if (aliveNeighbors.length < 2 || aliveNeighbors.length > 3) {
                    newGrid[i][j] = {
                        state: cellState.dead,
                        color: deadColor
                    }
                } else {
                    newGrid[i][j] = cell;
                }
            } else {
                if (aliveNeighbors.length === 3) {
                    newGrid[i][j] = {
                        state: cellState.alive,
                        color: aliveNeighbors[0].color
                    }
                } else {
                    newGrid[i][j] = cell;
                }
            }
        }
    }

    return newGrid;
}

const gameOfLife = (data, iterations) => {
    let grid = createGrid();
    grid = fillGrid(grid, data);

    for (let i = 0; i < iterations; i++) {
        grid = gameLogic(grid);
    }

    return grid;
}

// 
// Blob
// 

const blobFunc = () => {
    let blob = window.URL || window.webkitURL;
    if (!blob) {
        console.log('Your browser does not support Blob URLs :(');
        return;
    }

    document.getElementById('convert').addEventListener('click', function (event) {
        console.log("Starting to create image...");
        console.log("Picture URL: " + pictureUrl);

        document.getElementById('createdImage').src = null;
        document.getElementById('waitConvert').style.display = 'block';

        let canvas = document.createElement('canvas');



        canvas.width = pictureDimensions.x;
        canvas.height = pictureDimensions.y;

        let ctx = canvas.getContext('2d');

        let img = new Image();

        img.onload = () => {
            setTimeout(() => {
                ctx.drawImage(img, 0, 0);
                drawSongData();
            }, 500);
        };

        img.onerror = () => {
            console.error("Error loading image:", pictureUrl);
        };

        img.src = pictureUrl;

        function drawSongData() {
            // console.log("x: " + pictureDimensions.x + " y: " + pictureDimensions.y);
            // console.log("Song data: " + songDataBase10.length + " characters");

            const iterations = document.getElementById('iterations').value;

            console.log("Iterations: " + iterations);

            let songToPictureData = dataToArt(songDataBase10, pictureDimensions.x.toString(), pictureDimensions.y.toString());
            let lifeGrid = gameOfLife(songToPictureData, +iterations);

            console.log("Drawing song data...");

            for (let i = 0; i < lifeGrid.length; i++) {
                for (let j = 0; j < lifeGrid[i].length; j++) {
                    let cell = lifeGrid[i][j];
                    if (cell.state === cellState.none) {
                        continue;
                    } else if (cell.state === cellState.dead) {
                        ctx.fillStyle = 'rgb(' + deadColor[0] + ',' + deadColor[1] + ',' + deadColor[2] + ')';
                        ctx.fillRect(i, j, 1, 1);
                        continue;
                    }
                    ctx.fillStyle = 'rgb(' + cell.color[0] + ',' + cell.color[1] + ',' + cell.color[2] + ')';
                    ctx.fillRect(i, j, 1, 1);
                }
            }

            console.log("Image created.");

            let createdImageElement = document.getElementById('createdImage');

            if (createdImageElement) {
                createdImageElement.src = canvas.toDataURL();
            } else {
                console.error("Could not find element with id 'createdImage' to display the created image.");
            }

            document.getElementById('waitConvert').style.display = 'none';

        }
    });

    document.getElementById('pictureFile').addEventListener('change', function (event) {
        let file = this.files[0];

        if (!file) {
            return;
        }

        if (!file.type || !file.type.startsWith('image/png')) {
            console.log('Please select a PNG image file.');
            return;
        }

        document.getElementById('selectedImage').src = null;

        let img = new Image();

        let fileURL = blob.createObjectURL(file);

        console.log('File name: ' + file.name);
        console.log('File type: ' + file.type);
        console.log('File BlobURL: ' + fileURL);

        img.onload = function () {
            console.log('Image dimensions: ' + this.width + 'x' + this.height);
            pictureDimensions.x = this.width;
            pictureDimensions.y = this.height;
        }

        pictureUrl = fileURL;
        img.src = fileURL;

        document.getElementById('selectedImage').src = fileURL;
    });

    document.getElementById('songFile').addEventListener('change', function (event) {
        let file = this.files[0];
        let fileURL = blob.createObjectURL(file);

        document.getElementById('waitLoad').style.display = 'block';

        // document.getElementById('convertedSong').value = "";

        console.log(file);
        console.log('File name: ' + file.name);
        console.log('File type: ' + file.type);
        console.log('File BlobURL: ' + fileURL);

        let baseWorker = new Worker('baseWorker.js');
        baseWorker.addEventListener('message', (e) => {
            songDataBase10 = e.data;
            // document.getElementById('convertedSong').value = e.data;
            document.getElementById('waitLoad').style.display = 'none';
        }, false);
        baseWorker.postMessage(file);
    });
}

blobFunc();