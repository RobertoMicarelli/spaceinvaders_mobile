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

function drawInvader(invader) {
  fill(invader.color);
  noStroke();
  switch(invader.type) {
    case 0: // Granchio
      rect(invader.x - 15, invader.y - 10, 30, 20);
      triangle(invader.x - 15, invader.y + 10, invader.x - 20, invader.y + 15, invader.x - 10, invader.y + 15);
      triangle(invader.x + 15, invader.y + 10, invader.x + 10, invader.y + 15, invader.x + 20, invader.y + 15);
      fill(255);
      ellipse(invader.x - 8, invader.y - 5, 6, 6);
      ellipse(invader.x + 8, invader.y - 5, 6, 6);
      break;
    case 1: // Polpo
      ellipse(invader.x, invader.y, 30, 20);
      for(let i = 0; i < 4; i++) {
        let angle = map(i, 0, 3, -PI/4, PI/4);
        let x = invader.x + cos(angle) * 15;
        let y = invader.y + sin(angle) * 15;
        ellipse(x, y, 8, 8);
      }
      fill(255);
      ellipse(invader.x - 8, invader.y - 5, 6, 6);
      ellipse(invader.x + 8, invader.y - 5, 6, 6);
      break;
    case 2: // Medusa
      beginShape();
      vertex(invader.x, invader.y - 10);
      vertex(invader.x - 15, invader.y);
      vertex(invader.x, invader.y + 10);
      vertex(invader.x + 15, invader.y);
      endShape(CLOSE);
      for(let i = 0; i < 3; i++) {
        let x = invader.x - 10 + i * 10;
        line(x, invader.y + 10, x, invader.y + 15);
      }
      fill(255);
      ellipse(invader.x - 8, invader.y - 5, 6, 6);
      ellipse(invader.x + 8, invader.y - 5, 6, 6);
      break;
    case 3: // Ragno
      ellipse(invader.x, invader.y, 25, 25);
      for(let i = 0; i < 4; i++) {
        let angle = map(i, 0, 3, -PI/3, PI/3);
        let x1 = invader.x + cos(angle) * 12;
        let y1 = invader.y + sin(angle) * 12;
        let x2 = invader.x + cos(angle) * 20;
        let y2 = invader.y + sin(angle) * 20;
        line(x1, y1, x2, y2);
      }
      fill(255);
      ellipse(invader.x - 8, invader.y - 5, 6, 6);
      ellipse(invader.x + 8, invader.y - 5, 6, 6);
      break;
    case 4: // Calamaro
      beginShape();
      vertex(invader.x, invader.y - 15);
      vertex(invader.x - 10, invader.y);
      vertex(invader.x, invader.y + 15);
      vertex(invader.x + 10, invader.y);
      endShape(CLOSE);
      for(let i = 0; i < 3; i++) {
        let x = invader.x - 8 + i * 8;
        line(x, invader.y + 15, x, invader.y + 20);
      }
      fill(255);
      ellipse(invader.x - 8, invader.y - 5, 6, 6);
      ellipse(invader.x + 8, invader.y - 5, 6, 6);
      break;
  }
}

function updateInvaders() {
  let moveDown = false;
  let edgeReached = false;
  for (let invader of invaders) {
    if ((invader.x + invader.width/2 > width && invaderDirection > 0) ||
        (invader.x - invader.width/2 < 0 && invaderDirection < 0)) {
      edgeReached = true;
      break;
    }
  }
  if (edgeReached) {
    invaderDirection *= -1;
    moveDown = true;
  }
  for (let i = invaders.length - 1; i >= 0; i--) {
    let invader = invaders[i];
    if (moveDown) {
      invader.y += 15;
    } else {
      invader.x += invaderSpeed * invaderDirection;
    }
    drawInvader(invader);
    if (random(1) < 0.01 && millis() - lastInvaderShot > 500) {
      invaderBullets.push({
        x: invader.x,
        y: invader.y + invader.height/2,
        speed: 3
      });
      lastInvaderShot = millis();
    }
  }
}

function playLaserSound() {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playEnemyExplosion(type) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  switch(type) {
    case 0:
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2);
      break;
    case 1:
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(165, audioContext.currentTime + 0.2);
      break;
    case 2:
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
      break;
    case 3:
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(550, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(275, audioContext.currentTime + 0.2);
      break;
    case 4:
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.2);
      break;
  }
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

function playLifeLostSound() {
  if (!audioContext || millis() - lastLifeSound < 500) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 0.5);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
  lastLifeSound = millis();
}

function playBonusSound() {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.y -= 5;
    fill(255);
    rect(bullet.x - 2, bullet.y - 5, 4, 10);
    for (let j = invaders.length - 1; j >= 0; j--) {
      let invader = invaders[j];
      if (bullet.x > invader.x - invader.width/2 &&
          bullet.x < invader.x + invader.width/2 &&
          bullet.y > invader.y - invader.height/2 &&
          bullet.y < invader.y + invader.height/2) {
        score += invader.points;
        playEnemyExplosion(invader.type);
        invaders.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
    for (let shield of shields) {
      if (shield.health > 0 &&
          bullet.x > shield.x - shield.width/2 &&
          bullet.x < shield.x + shield.width/2 &&
          bullet.y > shield.y - shield.height/2 &&
          bullet.y < shield.y + shield.height/2) {
        shield.health--;
        bullets.splice(i, 1);
        break;
      }
    }
    if (bullet.y < 0) {
      bullets.splice(i, 1);
    }
  }
}

function updateInvaderBullets() {
  for (let i = invaderBullets.length - 1; i >= 0; i--) {
    let bullet = invaderBullets[i];
    bullet.y += bullet.speed;
    fill(255, 0, 0);
    rect(bullet.x - 2, bullet.y - 5, 4, 10);
    if (bullet.x > player.x - player.width/2 &&
        bullet.x < player.x + player.width/2 &&
        bullet.y > player.y - player.height/2 &&
        bullet.y < player.y + player.height/2) {
      lives--;
      playLifeLostSound();
      invaderBullets.splice(i, 1);
      if (lives <= 0) {
        gameOver = true;
      }
      break;
    }
    for (let shield of shields) {
      if (shield.health > 0 &&
          bullet.x > shield.x - shield.width/2 &&
          bullet.x < shield.x + shield.width/2 &&
          bullet.y > shield.y - shield.height/2 &&
          bullet.y < shield.y + shield.height/2) {
        shield.health--;
        invaderBullets.splice(i, 1);
        break;
      }
    }
    if (bullet.y > height) {
      invaderBullets.splice(i, 1);
    }
  }
}

function drawShields() {
  for (let shield of shields) {
    if (shield.health > 0) {
      push();
      translate(shield.x - shield.width/2, shield.y - shield.height/2);
      fill(shield.color);
      noStroke();
      beginShape();
      vertex(0, shield.height);
      vertex(shield.width, shield.height);
      vertex(shield.width * 0.9, shield.height * 0.8);
      vertex(shield.width * 0.8, shield.height * 0.6);
      vertex(shield.width * 0.7, shield.height * 0.4);
      vertex(shield.width * 0.6, shield.height * 0.3);
      vertex(shield.width * 0.4, shield.height * 0.2);
      vertex(shield.width * 0.3, shield.height * 0.3);
      vertex(shield.width * 0.2, shield.height * 0.4);
      vertex(shield.width * 0.1, shield.height * 0.6);
      vertex(0, shield.height * 0.8);
      endShape(CLOSE);
      fill(255, 255, 255, 100);
      noStroke();
      for(let i = 0; i < 3; i++) {
        let y = shield.height * (0.3 + i * 0.2);
        beginShape();
        vertex(shield.width * 0.2, y);
        vertex(shield.width * 0.8, y);
        vertex(shield.width * 0.7, y + 2);
        vertex(shield.width * 0.3, y + 2);
        endShape(CLOSE);
      }
      fill(255, 255, 255, 150);
      for(let i = 0; i < shield.health; i++) {
        let x = shield.width * (0.3 + i * 0.2);
        ellipse(x, shield.height * 0.2, 6, 6);
      }
      pop();
    }
  }
}

function drawHUD() {
  fill(255);
  textAlign(LEFT);
  textSize(20);
  text(`Score: ${score}`, 20, 30);
  text(`Lives: ${lives}`, 20, 60);
  text(`Level: ${level}`, 20, 90);
}

function checkInvaderReach() {
  for (let invader of invaders) {
    if (invader.y + invader.height/2 > player.y - player.height/2) {
      gameOver = true;
      break;
    }
  }
  if (invaders.length === 0) {
    level++;
    lives++;
    playBonusSound();
    shieldHealth = Math.floor(5 * Math.pow(1.5, level - 1));
    invaderSpeed += 0.5;
    createInvaders();
    createShields();
  }
}

function touchStarted() {
  // Richiesta permesso sensori su iOS
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(response => {
      // Puoi gestire la risposta se vuoi
    }).catch(console.error);
  }
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

function deviceMoved() {
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

function touchEnded() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
} 
