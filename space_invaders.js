let player;
let invaders = [];
let bullets = [];
let invaderBullets = [];
let score = 0;
let gameOver = false;
let lives = 5;
let invaderDirection = 1;
let invaderSpeed = 0.3;
let lastInvaderShot = 0;
let shields = [];
let gameStarted = false;
let playerVelocity = 0;
let playerMaxSpeed = 20;
let playerFriction = 0.9;
let level = 1;
let shieldHealth = 5;
let audioContext;
let lastLifeSound = 0;
let moveInput = 0; // -1 sinistra, 1 destra

function setup() {
  createCanvas(windowWidth, windowHeight);
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  player = {
    x: width / 2,
    y: height - 50,
    width: 60,
    height: 40,
    speed: 20
  };
  createInvaders();
  createShields();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  player.x = width / 2;
  player.y = height - 50;
  createShields();
}

function createInvaders() {
  invaders = [];
  const rows = 5;
  const cols = 10;
  const spacing = 60;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      invaders.push({
        x: j * spacing + 100,
        y: i * spacing + 50,
        width: 40,
        height: 30,
        points: (rows - i) * 10,
        type: i,
        color: i === 0 ? color(255, 0, 0) : 
               i === 1 ? color(255, 165, 0) : 
               i === 2 ? color(255, 255, 0) : 
               i === 3 ? color(0, 255, 0) : 
               color(0, 0, 255)
      });
    }
  }
}

function createShields() {
  shields = [];
  const shieldWidth = 80;
  const shieldHeight = 40;
  const spacing = width / 5;
  for (let i = 0; i < 4; i++) {
    shields.push({
      x: (i + 1) * spacing,
      y: height - 150,
      width: shieldWidth,
      height: shieldHeight,
      health: shieldHealth,
      color: i === 0 ? color(0, 255, 255) : // Ciano
             i === 1 ? color(255, 0, 255) : // Magenta
             i === 2 ? color(255, 255, 0) : // Giallo
             color(0, 255, 0) // Verde
    });
  }
}

function draw() {
  background(0);
  if (!gameStarted) {
    showStartScreen();
    return;
  }
  if (gameOver) {
    showGameOver();
    return;
  }
  // Movimento tramite accelerometro
  playerVelocity = moveInput * player.speed;
  player.x += playerVelocity;
  player.x = constrain(player.x, player.width/2, width - player.width/2);
  drawPlayer();
  updateInvaders();
  updateBullets();
  updateInvaderBullets();
  drawShields();
  drawHUD();
  checkInvaderReach();
}

function showStartScreen() {
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text("SPACE INVADERS", width/2, height/2 - 50);
  textSize(24);
  text("Tocca lo schermo per iniziare", width/2, height/2 + 50);
}

function showGameOver() {
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text("GAME OVER", width/2, height/2 - 50);
  textSize(24);
  text(`Punteggio finale: ${score}`, width/2, height/2);
  text("Tocca per rigiocare", width/2, height/2 + 50);
}

function drawPlayer() {
  fill(0, 255, 0);
  noStroke();
  rect(player.x - player.width/2, player.y - player.height/2, player.width, player.height);
  rect(player.x - 10, player.y - player.height/2 - 10, 20, 10);
  triangle(
    player.x - player.width/2, player.y - player.height/2,
    player.x - player.width/2 - 10, player.y - player.height/2 + 10,
    player.x - player.width/2, player.y - player.height/2 + 10
  );
  triangle(
    player.x + player.width/2, player.y - player.height/2,
    player.x + player.width/2 + 10, player.y - player.height/2 + 10,
    player.x + player.width/2, player.y - player.height/2 + 10
  );
  rect(player.x - 2, player.y - player.height/2 - 20, 4, 20);
}

// (Le funzioni drawInvader, updateInvaders, updateBullets, updateInvaderBullets, drawShields, drawHUD, checkInvaderReach, playLaserSound, playEnemyExplosion, playLifeLostSound, playBonusSound sono identiche alla versione attuale e vanno copiate qui)

function touchStarted() {
  if (!gameStarted) {
    gameStarted = true;
    return false;
  }
  if (gameOver) {
    resetGame();
    return false;
  }
  if (gameStarted && !gameOver) {
    bullets.push({
      x: player.x,
      y: player.y - player.height/2,
      speed: 5
    });
    playLaserSound();
    return false;
  }
}

// Movimento tramite accelerometro/giroscopio
function deviceMoved() {
  // Su iOS/Android, gamma è inclinazione laterale
  if (typeof rotationY !== 'undefined') {
    if (rotationY > 20) {
      moveInput = 1;
    } else if (rotationY < -20) {
      moveInput = -1;
    } else {
      moveInput = 0;
    }
  } else if (typeof accelerationX !== 'undefined') {
    if (accelerationX > 5) {
      moveInput = -1;
    } else if (accelerationX < -5) {
      moveInput = 1;
    } else {
      moveInput = 0;
    }
  }
}

function resetGame() {
  score = 0;
  lives = 5;
  gameOver = false;
  invaderSpeed = 0.3;
  level = 1;
  shieldHealth = 5;
  bullets = [];
  invaderBullets = [];
  createInvaders();
  createShields();
  player.x = width / 2;
}

// Attiva l'audio al primo tocco
function touchEnded() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
} 
