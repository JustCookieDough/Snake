const canvas = document.getElementById('mainCanvas')
const ctx = canvas.getContext('2d')
const scoreDisp = document.getElementById('scoreDisplay')
const highScoreDisp = document.getElementById('highScoreDisplay')
document.addEventListener('keydown', keydownHandler, false)
var buttonQueue = []
var restart = false


async function main() {
    const colorDict = await getColors()
    const backgroundColor = colorDict['backgroundColor']
    const snakeColor = colorDict['snakeColor']
    const appleColor = colorDict['appleColor']

    const drawChunky = await getDrawMode()
    console.log(drawChunky)

    score = 0
    s = new Head(16, 24, 'l', snakeColor)
    s.lengthen()
    s.lengthen()
    a = new Apple(s, 16, 24, appleColor)
    updateHighScore()
    buttonQueue = []

    function draw() {
        updateDirection(s)
        drawBackground(backgroundColor)
        s.slither()
        if (a.testIfEaten()) {
            score++
        }
        if (s.checkCollisionWithWall() || s.checkCollisionWithSelf() || restart) {
            s = new Head(16, 24, 'l', snakeColor)
            s.lengthen()
            s.lengthen()
            a = new Apple(s, 16, 24, appleColor)
            updateHighScore(score)
            buttonQueue = []
            score = 0
            restart = false
        }
        if (drawChunky) {
            s.drawChunky()
            a.drawChunky()
        } else {
            s.draw()
            a.draw()
        }
        updateScore(score)
    }

    setInterval(draw, 200)
}

function drawBackground(color)  {
    ctx.beginPath();
    ctx.rect(0, 0, 320, 480);
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath();
}

function drawSquare(x, y, size, color) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath();
}

function updateDirection(snake) {
    console.log(buttonQueue)
    // gets rid of any button presses that dont change the snakes direction
    while (buttonQueue[0] == snake.fd || buttonQueue[0] == oppositeD(snake.fd)) { buttonQueue.shift() }
    // if the queue isnt empty
    if (buttonQueue.length != 0) { 
        // sets the facing direction to the first element in the queue and removes it from the list
        snake.fd = buttonQueue.shift()
    }
}

function keydownHandler(e) {
    // maxes the queue out at length 4 (prevents dumb stuff from happening when you spam keys)
    if (buttonQueue.length > 2) {
        buttonQueue.pop()
    }
    // this looks like hot garbage but it works baby! :D
    if (e.key == "Right" || e.key == "ArrowRight") {
        buttonQueue.push("r")
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        buttonQueue.push("l")
    } else if (e.key == "Up" || e.key == "ArrowUp") {
        buttonQueue.push("u")
    } else if (e.key == "Down" || e.key == "ArrowDown") {
        buttonQueue.push("d")
    } else if (e.key == "r" || e.key == "R") {
        restart = true
    }
}

function updateScore(score) {
    scoreDisp.innerHTML = score
}

function updateHighScore(score) {
    chrome.storage.sync.get(['highscore'], (result) => {
        currentHighScore = result['highscore']
        if (currentHighScore < score) {
            chrome.storage.sync.set({'highscore': score}, () => {
                console.log('setting new highscore')
            })
            highScoreDisp.innerHTML = score
        } else {
            highScoreDisp.innerHTML = currentHighScore
        }
    })
}

function oppositeD(direction) {
    switch (direction) {
    case "r":
        return "l"
    case "l":
        return "r"
    case "u":
        return "d"
    case "d":
        return "u"
    default:
        throw("direction not one of 'u'|'d'|'l'|'r'")
    }
}

async function getColors() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(['backgroundColor', 'snakeColor', 'appleColor'], (dict) => {
                resolve(dict)
            })
        }
        catch (ex) {
            reject(ex);
        }
    });
}

async function getDrawMode() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(['drawChunky'], (resp) => {
                resolve(resp['drawChunky'])
            })
        }
        catch (ex) {
            reject(ex);
        }
    })
}

class Snake {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.nextSnake = null
        this.color = color
    }

    move(x, y) {
        this.x = x
        this.y = y
    }

    draw(snake=null) {
        drawSquare(this.x*20 + 5, this.y*20 + 5, 10, this.color) // draw small center square
        if (snake != null) {  // connect the dots
            drawSquare(this.x*20 + (snake.x - this.x)*10 + 5, this.y*20 + (snake.y - this.y)*10 + 5, 10, snake.color)
        }
        if (this.hasNextSnake()) { // move through the snakeee
            this.nextSnake.draw(this)
        }
    }

    drawChunky() {
        drawSquare(this.x*20, this.y*20, 20, this.color)
        if (this.hasNextSnake()) {
            this.nextSnake.drawChunky()
        }
    }

    slither(x, y) {
        if (this.hasNextSnake()) {
            this.nextSnake.slither(this.x, this.y)
        }
        this.move(x, y)
    }

    lengthen() {
        if (this.hasNextSnake()) {
            this.nextSnake.lengthen()
        } else {
            this.nextSnake = new Snake(this.x, this.y, this.color)
        }
    }

    hasNextSnake() {
        return this.nextSnake != null
    }

    checkIfOn(x, y) {
        if (this.x == x && this.y == y) return true
        if (!this.hasNextSnake()) return false
        return this.nextSnake.checkIfOn(x, y)
    }
}

class Head extends Snake{
    constructor(bw, bh, fd, color) {
        super(bw/2, bh/2, color)
        this.fd = fd;
		this.bw = bw;
		this.bh = bh;
    }

    slither() {
        this.nextSnake.slither(this.x, this.y)
        switch (this.fd) {
            case 'l':
                this.move(this.x - 1, this.y)
                break;
            case 'r':
                this.move(this.x + 1, this.y)
                break;
            case 'u':
                this.move(this.x, this.y - 1)
                break;
            case 'd':
                this.move(this.x, this.y + 1)
                break;
        }
    }

    checkCollisionWithSelf() {
        return this.nextSnake.checkIfOn(this.x, this.y)
    }

    checkCollisionWithWall() {
        return (this.x < 0 || this.x >= this.bw || this.y < 0 || this.y >= this.bh)
    }
}

class Apple{
    constructor(head, bw, bh, color) {
        this.bw = bw
        this.bh = bh
        this.head = head
        this.relocate()
        this.color = color
    }

    move(x, y) {
        this.x = x
        this.y = y
    }

    draw() {
        drawSquare(this.x*20 + 5, this.y*20 + 5, 10, this.color)
    }

    drawChunky() {
        drawSquare(this.x*20, this.y*20, 20, this.color)
    }

    relocate() {
        var posX
        var posY
        do {
            posX = Math.floor(Math.random() * this.bw)
            posY = Math.floor(Math.random() * this.bh)
        } while (this.head.checkIfOn(posX, posY))

        this.move(posX, posY)
    }
    
    testIfEaten() {
        if (this.head.checkIfOn(this.x, this.y)) {
            this.head.lengthen()
            this.relocate()
            return true
        } return false
    }
}

main()