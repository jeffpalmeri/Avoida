const canvas = document.getElementById('avoida');
const context = canvas.getContext('2d');

let settings = {
  playerHeight: 40,
  playerWidth: 40,
  playerRadius: 20,
  numSquares: 4,
  // squareWidth: 80,
  squareWidth: [80, 90, 30, 100],
  // squareHeight: 80,
  squareHeight: [80, 65, 80, 30],
  posX: [10, canvas.width - (110), 20, canvas.width - (120)],
  posY: [10, 80, canvas.height - 100, canvas.height - 100],
  changeX: [3, -2, 2, -2],
  changeY: [2, 2, -3, -2]
}

let player = {
  playerWidth: 40,
  playerHeight: 40,
  playerRadius: settings.playerRadius,
  playerPosX: (canvas.width / 2) - settings.playerRadius,
  playerPosY: (canvas.height / 2) - settings.playerRadius
}

class Square {
  constructor(settings, i) {
    this.id = i;
    // this.squareWidth = settings.squareWidth;
    this.squareWidth = settings.squareWidth[i];
    // this.squareHeight = settings.squareHeight;
    this.squareHeight = settings.squareHeight[i];
    this.posX = settings.posX[i];
    this.posY = settings.posY[i];
    this.radiusX = this.squareWidth/2;
    this.radiusY = this.squareHeight/2;
    this.changeX = settings.changeX[i];
    this.changeY = settings.changeY[i];
  }
}

let squares = [];

function initGame() {
  for(let i = 0; i < settings.numSquares; i++) {
    squares.push(new Square(settings, i));
  }
}

initGame();

function drawSquares() {
  squares.forEach((square) => {
    context.fillStyle = '#0095dd';
    context.fillRect(square.posX, square.posY, square.squareWidth, square.squareHeight);
  });
}

function drawPlayer() {
  context.fillStyle = 'red';
  context.fillRect(player.playerPosX, player.playerPosY, player.playerWidth, player.playerHeight);
}

let mousedown = false;
document.addEventListener('mousedown', () => {mousedown = true});
document.addEventListener('mouseup', () => {mousedown = false});
document.addEventListener('mousemove', movePlayerHandler);

function movePlayerHandler(e) {
  if(mousedown === true) {

    let relativeX = e.clientX - canvas.offsetLeft;
    let relativeY = e.clientY - canvas.offsetTop;
  
    if(relativeX > 0 && relativeX < canvas.width && relativeY > 0 && relativeY < canvas.height) {
      player.playerPosX = relativeX - player.playerRadius;
      player.playerPosY = relativeY - player.playerRadius;
    }
  }
}

function collisionDetection() {
  return new Promise((resolve, reject) => {
    squares.forEach((square) => {
      if(player.playerPosX + player.playerWidth > square.posX && player.playerPosX < square.posX + square.squareWidth && player.playerPosY + player.playerHeight > square.posY && player.playerPosY < square.posY + square.squareHeight) {
        resolve(true);
      } else if(player.playerPosX < 0 || player.playerPosX > canvas.width - player.playerWidth) {
        resolve(true);
      } else if(player.playerPosY < 0 || player.playerPosY > canvas.height - player.playerHeight) {
        resolve(true);
      } 
    });
    reject();
  });
}

// function wallCollision() {
//   return new Promise((resolve, reject) => {
//     if(player.playerPosX < 0 || player.playerPosX > canvas.width - player.playerWidth ) {
//       resolve(true);
//     }
//     reject()
//   });
// }

let gameStarted = false;
let startTime;
canvas.addEventListener('mousedown', firstMousedown, {passive: true});

function firstMousedown() {
  gameStarted = true;
  startTime = new Date();
  canvas.removeEventListener('mousedown', firstMousedown, {passive: true});
}

function increaseSpeed() {
  if(gameStarted) {
    squares.forEach((square) => {
      square.changeX *= 1.3;
      square.changeY *= 1.3;
    })
  }
}

function playGame(bool) {
  if(bool) {
    squares.forEach((square) => {
      square.posX += square.changeX;
      square.posY += square.changeY;
  
      if(square.posX + square.changeX > canvas.width - square.squareWidth || square.posX + square.changeX < 0) square.changeX *= -1;
      if(square.posY + square.changeY > canvas.height - square.squareHeight || square.posY + square.changeY < 0) square.changeY *= -1;
    });

    let collision = collisionDetection();
    collision.then(() => {
      var endTime = new Date();
      var timeDiff = (endTime - startTime)/1000;
      // console.log(timeDiff);
      gameStarted = false;
      addToModal(timeDiff);
      $('#exampleModal').modal({show: true, backdrop: 'static'});
      adjustDOM(timeDiff);
    })
    .catch(() => {});
  }
}

let scoreModal = document.getElementById('spawnModal');
let highScores = document.getElementById('list-of-scores');

// function addToDOM(time) {
//   let newScore = document.createElement('LI');
//   let text = document.createTextNode(`${localStorage.getItem("time")}`);
//   newScore.appendChild(text);
//   highScores.appendChild(newScore);
// }

function adjustDOM(time) {
  let yourScore = document.getElementById('your-score');
  
  if(localStorage.getItem("time") == null || localStorage.getItem("time") == "undefined") {
    localStorage.setItem("time", time);
    // yourScore.innerHTML = localStorage.getItem("time");
    return yourScore.innerHTML = "";
  }
  
  if(time > parseFloat(localStorage.getItem("time")) || localStorage.getItem("time") == "undefined") {
    localStorage.setItem("time", time);
    // yourScore.innerHTML = localStorage.getItem("time");
  }
  yourScore.innerHTML = localStorage.getItem("time");
}

let modalSpan = document.getElementById('modal-time');
function addToModal(time) {
  modalSpan.innerHTML = `${time} seconds!`;
}

// addToDOM();
document.getElementById('play-again-button').addEventListener('click', (e) => {
  document.location.reload();
})

adjustDOM();

function adjustScore(time) {
  if(time > parseFloat(localStorage.getItem("time"))) {
    localStorage.setItem("time", time);

  }
}

setInterval(increaseSpeed, 4000);

function draw() {
  context.clearRect(0, 0, canvas.clientWidth, canvas.height);
  drawSquares();
  drawPlayer();
  
  playGame(gameStarted);
  
  requestAnimationFrame(draw);
}

draw();

console.log(squares);