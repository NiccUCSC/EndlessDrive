class UI extends Phaser.Scene {
    constructor() {
        super('uiScene')
    }

    init() {
        World.initUIScene(this)
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('speedomoter', 'Speedomoter3.png')
        this.load.image('speedomoterNeedle', 'SpeedomoterNeedle2.png')
        this.load.spritesheet('health', 'Health.png', { frameWidth: 200, frameHeight: 80 })

        this.load.spritesheet('numbers', 'numbers.png', { frameWidth: 16, frameHeight: 24 })
    }

    create() {
        this.add.tilemap()

        this.numDigits = 7
        this.numbers = []
        for (let i = 0; i < this.numDigits; i++) this.numbers.push(this.add.sprite(0, 0, "numbers", 0).setOrigin(0.5, 0))

        this.speedomoter = this.add.sprite(0, 0, "speedomoter").setOrigin(0.5, 1)
        this.speedomoterNeedle = this.add.sprite(0, 0, "speedomoterNeedle").setOrigin(0.84, 0.5)

        this.healthDisplay = this.add.sprite(0, 0, "health", 0).setOrigin(0.5, 1)
        this.engineHealth = this.add.sprite(0, 0, "health", 1).setOrigin(12/200, 12/80)
        this.wheelHealth = this.add.sprite(0, 0, "health", 2).setOrigin(107/200, 12/80)
    }

    physicsUpdate(time, dt) {

        let digits = ParseDigits(World.gameScore, this.numDigits)
        for (let i = 0; i < this.numDigits; i++)
            this.numbers[i].setFrame(digits[i])

        let speed = Math.sqrt(World.carSpeedSquared)
        let angle = speed * Math.PI / 80
        this.speedomoterNeedle.setRotation(angle)
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000

        let wid = World.screenWidth
        let hei = World.screenHeight
        let cx = wid / 2
        let cy = hei / 2
        let unit = World.screenUnit

        this.healthDisplay.setPosition(wid - 110*unit, hei - 5*unit)
        this.healthDisplay.setDisplaySize(200*unit, 80*unit)

        this.engineHealth.setPosition(wid - (210-12)*unit, hei - (5+68)*unit)
        this.engineHealth.setDisplaySize(200*unit*World.playerEngineHealth, 80*unit)

        this.wheelHealth.setPosition(wid - (210-107)*unit, hei - (5+68)*unit)
        this.wheelHealth.setDisplaySize(200*unit*World.playerWheelsHealth, 80*unit)

        this.speedomoter.setPosition(wid - 110*unit, hei - 85*unit)
        this.speedomoter.setDisplaySize(200*unit, 120*unit)
        this.speedomoterNeedle.setPosition(wid - 110*unit, hei - 102*unit)
        this.speedomoterNeedle.setDisplaySize(120*unit, 200*unit)
        for (let i = 0; i < this.numDigits; i++) {
            let wid = 24 * unit
            let hei = 36 * unit

            this.numbers[i].setPosition(cx + (2*i + 1 - this.numDigits) * wid / 2, 10 * unit)
            this.numbers[i].setDisplaySize(wid, hei)
        }


    }
}