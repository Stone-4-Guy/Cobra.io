const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ================= DATA ================= */
let user = "Guest";
let coins = 0;

let currentSkin = "green";
let ownedSkins = ["green"];

let mode = "single";

let snake = [];
let snake2 = [];

let dx = 20;
let dy = 0;

let dx2 = -20;
let dy2 = 0;

let fruit = {x:300,y:300};

let boosting = false;
let boostEnergy = 5;
let speed = 110;

let particles = [];
let loop;

/* ================= SOUND ================= */
const eatSound = new Audio("assets/eat.wav");
const gameOverSound = new Audio("assets/gameover.wav");
const bgMusic = new Audio("assets/bg.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.3;

/* ================= LOGIN ================= */
function login(){

    const name = document.getElementById("username").value.trim();

    if(name !== ""){
        user = name;
    }

    let savedCoins = localStorage.getItem(user + "_coins");
    let savedSkin = localStorage.getItem(user + "_skin");
    let savedOwned = localStorage.getItem(user + "_owned");

    coins = savedCoins ? parseInt(savedCoins) : 5;

    if(savedSkin) currentSkin = savedSkin;

    if(savedOwned){
        ownedSkins = JSON.parse(savedOwned);
    }

    updateCoins();
    alert("Logged in as " + user);
}

/* ================= SAVE ================= */
function saveData(){
    localStorage.setItem(user + "_coins", coins);
    localStorage.setItem(user + "_skin", currentSkin);
    localStorage.setItem(user + "_owned", JSON.stringify(ownedSkins));
}

/* ================= UI ================= */
function updateCoins(){
    document.getElementById("coinsDisplay").innerText = "Coins: " + coins;
}

/* ================= CONTACT ================= */
function showContact(){
    alert(
`Email: 67.skibidi.toilet.stone4@gmail.com

Phone: 0858 4561 1308`
    );
}
function showCodesInfo(){
    alert("Find codes in comments, captions, and special places.");
}

/* ================= SETTINGS ================= */
function openSettings(){

    let code = prompt(
`Redeem Codes:

COBRA67
NEELTEGOAT
STONE4
3CUBE9
SINGH@SHREYAS
#SIR@AKHILESH
#BEST GAME EVER

Enter Code:`);

    if(!code) return;

    code = code.toUpperCase();

    const rewards = {
        COBRA67:10,
        NEELTEGOAT:15,
        STONE4:10,
        "3CUBE9":15,
        "SINGH@SHREYAS":20,
        "#SIR@AKHILESH":30,
        "#BEST GAME EVER":15
    };

    if(rewards[code]){
        coins += rewards[code];
        saveData();
        updateCoins();
        alert("Code redeemed!");
    }else{
        alert("Invalid code");
    }
}

/* ================= SHOP ================= */
function openShop(){

    document.getElementById("menu").style.display = "none";
    document.getElementById("shop").style.display = "block";

    const skins = [
        {name:"green", price:0, color:"#00ff66"},
        {name:"red", price:50, color:"#ff4444"},
        {name:"blue", price:50, color:"#33aaff"},
        {name:"gold", price:150, color:"#ffd700"},
        {name:"purple", price:250, color:"#bb66ff"}
    ];

    let html = "";

    skins.forEach(s=>{

        let owned = ownedSkins.includes(s.name);

        html += `
        <div class="skinCard">
            <div class="skinPreview" style="background:${s.color};"></div>
            <h3>${s.name.toUpperCase()}</h3>
            <p>${owned ? "OWNED" : s.price + " Coins"}</p>
            <button onclick="buySkin('${s.name}',${s.price})">
                ${owned ? "EQUIP" : "BUY"}
            </button>
        </div>
        `;
    });

    document.getElementById("skins").innerHTML = html;
}

function closeShop(){
    document.getElementById("shop").style.display = "none";
    document.getElementById("menu").style.display = "block";
}

function buySkin(name, price){

    if(ownedSkins.includes(name)){
        currentSkin = name;
        saveData();
        alert(name + " equipped");
        return;
    }

    if(coins >= price){
        coins -= price;
        ownedSkins.push(name);
        currentSkin = name;
        saveData();
        updateCoins();
        openShop();
    }else{
        alert("Not enough coins");
    }
}

/* ================= GAME START ================= */
function startGame(){

    mode = "single";

    snake = [
        {x:200,y:200},
        {x:180,y:200},
        {x:160,y:200}
    ];

    dx = 20;
    dy = 0;

    begin();
}

function start1v1(){

    mode = "1v1";

    snake = [
        {x:160,y:200},
        {x:140,y:200},
        {x:120,y:200}
    ];

    snake2 = [
        {x:700,y:200},
        {x:720,y:200},
        {x:740,y:200}
    ];

    dx = 20; dy = 0;
    dx2 = -20; dy2 = 0;

    begin();
}

function begin(){

    document.getElementById("menu").style.display = "none";
    document.getElementById("shop").style.display = "none";
    canvas.style.display = "block";

    boostEnergy = 5;
    speed = 110;
    particles = [];

    spawnFruit();

    bgMusic.currentTime = 0;
    bgMusic.play();

    clearInterval(loop);
    loop = setInterval(update, speed);
}

/* ================= CONTROLS ================= */
document.addEventListener("keydown", e=>{

    if(e.key==="ArrowUp" && dy===0){dx=0;dy=-20;}
    if(e.key==="ArrowDown" && dy===0){dx=0;dy=20;}
    if(e.key==="ArrowLeft" && dx===0){dx=-20;dy=0;}
    if(e.key==="ArrowRight" && dx===0){dx=20;dy=0;}

    if(mode==="1v1"){
        if(e.key==="w" && dy2===0){dx2=0;dy2=-20;}
        if(e.key==="s" && dy2===0){dx2=0;dy2=20;}
        if(e.key==="a" && dx2===0){dx2=-20;dy2=0;}
        if(e.key==="d" && dx2===0){dx2=20;dy2=0;}
    }

    if(e.code==="Space"){
        boosting = true;
    }
});

document.addEventListener("keyup", e=>{
    if(e.code==="Space"){
        boosting = false;
    }
});

/* ================= FRUIT ================= */
function spawnFruit(){
    fruit = {
        x: Math.floor(Math.random()*44)*20,
        y: Math.floor(Math.random()*26)*20
    };
}

/* ================= UPDATE ================= */
function update(){

    if(boosting && boostEnergy > 0){
        clearInterval(loop);
        loop = setInterval(update, 55);
        boostEnergy -= 0.03;
        createTrail();
    }else{
        clearInterval(loop);
        loop = setInterval(update, 110);
    }

    moveSnake(snake, dx, dy, true);

    if(mode==="1v1"){
        moveSnake(snake2, dx2, dy2, false);
    }

    draw();
}

/* ================= MOVE ================= */
function moveSnake(arr, vx, vy, earnsCoins){

    let head = {
        x: arr[0].x + vx,
        y: arr[0].y + vy
    };

    if(head.x < 0 || head.y < 0 || head.x >= 900 || head.y >= 550){
        endGame();
        return;
    }

    arr.unshift(head);

    let hit =
        Math.abs(head.x-fruit.x) < 20 &&
        Math.abs(head.y-fruit.y) < 20;

    if(hit){

        if(earnsCoins){
            coins += 5;
            saveData();
            updateCoins();
        }

        eatSound.currentTime = 0;
        eatSound.play();

        spawnFruit();

    }else{
        arr.pop();
    }
}

/* ================= DRAW ================= */
function draw(){

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,900,550);

    /* GRID */
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for(let x=0;x<900;x+=20){
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,550);
        ctx.stroke();
    }

    for(let y=0;y<550;y+=20){
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(900,y);
        ctx.stroke();
    }

    /* TRAIL */
    particles.forEach(p=>{
        ctx.fillStyle = "rgba(0,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    /* APPLE */
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(fruit.x+10, fruit.y+10, 10, 0, Math.PI*2);
    ctx.fill();

    /* UI */
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(user, 15, 25);
    ctx.fillText("Coins: " + coins, 15, 50);

    ctx.textAlign = "right";
    ctx.fillText("Boost: " + Math.floor(boostEnergy), 885, 25);
    ctx.textAlign = "left";

    drawSnake(snake, currentSkin);

    if(mode==="1v1"){
        drawSnake(snake2, "blue");
    }
}

/* ================= SNAKE DRAW ================= */
function skinColor(name){

    if(name==="green") return "#00ff66";
    if(name==="red") return "#ff4444";
    if(name==="blue") return "#3399ff";
    if(name==="gold") return "#ffd700";
    if(name==="purple") return "#bb66ff";

    return "#00ff66";
}

function drawSnake(arr, skin){

    const color = skinColor(skin);

    for(let i=0;i<arr.length;i++){

        const s = arr[i];

        /* BOOST GLOW HEAD ONLY */
        if(i===0 && boosting && arr===snake && boostEnergy > 0){
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#00ffff";
        }else{
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x+10,s.y+10,10,0,Math.PI*2);
        ctx.fill();

        ctx.shadowBlur = 0;

        /* HEAD FACE */
        if(i===0){

            /* Eyes */
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(s.x+6,s.y+7,3,0,Math.PI*2);
            ctx.arc(s.x+14,s.y+7,3,0,Math.PI*2);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(s.x+6,s.y+7,1,0,Math.PI*2);
            ctx.arc(s.x+14,s.y+7,1,0,Math.PI*2);
            ctx.fill();

            /* Tongue */
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.x+10,s.y+18);
            ctx.lineTo(s.x+10,s.y+28);
            ctx.stroke();
        }
    }
}

/* ================= TRAIL ================= */
function createTrail(){

    let tail = snake[snake.length-1];

    particles.push({
        x:tail.x+10,
        y:tail.y+10,
        size:7,
        life:14
    });

    for(let i=particles.length-1;i>=0;i--){
        particles[i].size -= 0.25;
        particles[i].life--;

        if(particles[i].life<=0){
            particles.splice(i,1);
        }
    }
}

/* ================= END ================= */
function endGame(){

    clearInterval(loop);
    bgMusic.pause();
    gameOverSound.play();

    canvas.style.display = "none";
    document.getElementById("menu").style.display = "block";
}