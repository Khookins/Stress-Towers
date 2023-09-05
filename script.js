const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// Three bugs:
// 1. Tower's range is drawn from the center of the tower, but the tower itself is drawn from the top left corner.
//    The tower's center should be 0,0 (relative coordinates).
// 2. Towers continue firing on enemies even after they are dead (but only if they died within range).
// 3. Actions occur on every tick, even if the amount of time that has passed since the last tick was not consistent.
//    Normally game engines allow you to account for this with a function called "deltatime".


const objects = [];
const enemys = [];
const towers = [];

class Enemy{
    constructor(x, y, moveSpeed,enemyColor = "red", health = 100) {
        this.x = x
        this.y = y
        this.moveSpeed = moveSpeed
        this.enemyColor = enemyColor
        this.health = health
        enemys.push(this)
        objects.push(this)
    }
    draw(ctx) {
        if (this.health > 0) {
            ctx.fillStyle = this.enemyColor; //make color red
            ctx.fillRect(this.x, this.y, 10, 10);//draw rectange
            this.x += this.moveSpeed
            ctx.fillText(this.health, this.x, this.y + 20)
        }
    }
}
class Base{
    constructor(x, moveSpeed,enemyColor = "red", health = 100) {
        this.x = x
        this.moveSpeed = moveSpeed
        this.enemyColor = enemyColor
        this.health = health
    }
    draw(ctx) {
        ctx.fillStyle = this.enemyColor; //make color red
        ctx.fillRect(this.x, 100, 10, 10);//draw rectange
        this.x += this.moveSpeed 
    }
}

class TowerMenuItem{
    constructor(image="pistolMachine", dmg = 10, speed = 1, range = 50, name = "Pistol Machine") {
        this.image = image
        this.dmg = dmg
        this.speed = speed
        this.range = range
        this.name = name
    }

    placeTower(x, y) {
        new Tower(x, y, this.image, this.dmg, this.speed, this.range, this.name)
    }
}

class Tower{
    constructor(x, y, image = "pistolMachine", dmg = 10, speed = 1, range = 50, name = "Pistol Machine") {
        this.x = x
        this.y = y
        this.image = image
        this.loadedImage = null
        this.dmg = dmg
        this.speed = speed
        this.range = range
        this.name = name
        this.targetType = "first"

        towers.push(this)
        objects.push(this)

        this.shouldDrawAttack = false
        this.attackingPoint = null

        this.setShouldDrawAttack(false)
        this.setAttackingPoint(null)

        setInterval(() => { this.attack() }, 1000 / this.speed)
            
    }

    async loadImage() {
        try {
            this.loadedImage = await this._loadImageAsync(this.imageSrc);
        } catch (error) {
            console.error(`Failed to load image at ${this.imageSrc}`, error);
            // Handle the error as you see fit
        }   
    }

    // Promise-based image loading
    _loadImageAsync(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
            });
    }

    setAttackingPoint(point) {
        console.log(point)
        this.attackingPoint = point;
    }

    setShouldDrawAttack(value) {
        console.log(value)
        this.shouldDrawAttack = value;
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.strokeStyle = "blue"; //make color red
        ctx.arc(this.x,this.y,this.range,0,360)
        ctx.stroke()
        ctx.fillStyle = "grey"; //make color red
        ctx.fillRect(this.x, this.y, 10, 10);//draw rectange

        if(this.shouldDrawAttack == true && this.attackingPoint != null)
        {
            ctx.beginPath()
            ctx.strokeStyle = "green"
            ctx.lineWidth = 5
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(this.attackingPoint.x, this.attackingPoint.y)
            ctx.stroke()

            this.setAttackingPoint(null)
            this.setShouldDrawAttack(false)
        }
    

    }

    // note: we have tp find a way so that the towers target the first enemy
    inRange(enemy) {
        const distance = Math.sqrt( ((enemy.x - this.x) ** 2) + ((enemy.y - this.y) ** 2))
        return distance <= this.range
    }

    attack() {
        //we should set up a property for towers called "TargetType"
        const enemysInRange = []
        for (const enemy of enemys) {
            //step 1: get a list of all enemies in range
            if (this.inRange(enemy)) { enemysInRange.push(enemy) }
        }

        //step 2: go through that list, and find the one with highest x (or random if x == same)
        if (this.targetType == "first") {
            var firstEnemy = null
            var highestX = -1
            for (const enemy of enemysInRange) {
                if (firstEnemy == null) {
                    firstEnemy = enemy
                    highestX = firstEnemy.x
                } else if(enemy.x > highestX){
                    highestX = enemy.x
                    firstEnemy = enemy
                }
            }
            
            //step 3: attack that one (if there is one)
            if (firstEnemy != null) {
                this.setShouldDrawAttack(true)
                this.setAttackingPoint({x: firstEnemy.x, y: firstEnemy.y})
                firstEnemy.health -= this.dmg
            }
        }
              
    }
}


function setup() {
    //add enemies
    //const stressCube = new Enemy(100,0.1,"red",-1)
    const trashCube = new Enemy(100,100,0.1,"red",10)
    const weakCube = new Enemy(100,100,0.5,"yellow",50)
    const normalCube = new Enemy(100,100,1,"blue")
    const strongCube = new Enemy(100,100,1.5,"green",300)
    const bossCube = new Enemy(100,100,0.5,"green",2000)
    const testingCube = new Enemy(100,100,1,"red",999999999)

    setupHotbar()
}   

function setupHotbar() {
    const hotbar = document.getElementById("hotbar")

    const towerMenuItems = [
        new TowerMenuItem(100,70),
        new TowerMenuItem("./assets/pistol base.png", 10,10,70,"Machine Gunner"),
        new TowerMenuItem("./assets/pistol base.png", 1.5,9999999999,200,"HyperBeam"),
        new TowerMenuItem("./assets/pistol base.png", 50,0.3,100,"boom tube"),
    ]

    for (const towerMenuItem of towerMenuItems) {
        // Create the main container div element
        const hotbarItemElement = document.createElement("div");
        hotbar.appendChild(hotbarItemElement);
        //hotbarItemElement.id = towerMenuItem.name;
        hotbarItemElement.classList.add("hotbar-item");

        // Create the image element
        const imgElement = document.createElement("img");
        imgElement.src = towerMenuItem.image; // Assuming `towerMenuItem` has an `image` property
        imgElement.alt = towerMenuItem.name;

        // Create the text description element
        const pElement = document.createElement("p");
        pElement.classList.add("hotbar-item-name");
        pElement.innerText = towerMenuItem.name;

        // Attach an onclick event to the main container
        hotbarItemElement.onclick = () => {
            towerMenuItem.placeTower(100, 100);
        };

        // Append the image and text to the main container
        hotbarItemElement.appendChild(imgElement);
        hotbarItemElement.appendChild(pElement);

        // Append the main container to the hotbar
        hotbar.appendChild(hotbarItemElement);
    }
}

function tick() {
    ctx.clearRect(0, 0, width, height); //this clears the canvas

   
    
    for (const obj of objects) { //obj is a temporary variable we only care about in this loop
        //ctx.fillStyle = "red"; //make color red
        //ctx.fillRect(obj.x, 100, 10, 10);//draw rectange
       // obj.x += obj.moveSpeed
        obj.draw(ctx)
       
    }

    setTimeout(() => {
        requestAnimationFrame(tick); //this just says "hey, go to the next frame"
    }, 20);
    
}


//ASSET LOADING
async function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image at ${path}`));
    })
}

async function loadImages(imageUrls) {
    const imagePromises = imageUrs.map(loadImage)
    return await Promise.all(imagePromises)
}

//definitions above ^^^^^^^^^^

//we start calling functions down here!
//puro reference?????
//rip emy
setup();

tick();