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
        this.load.spritesheet('numbers', 'numbers.png', {
            frameWidth: 16, // Width of each frame
            frameHeight: 24, // Height of each frame
        })
    }

    create() {
        this.add.tilemap()

        this.numDigits = 7
        this.numbers = []
        for (let i = 0; i < this.numDigits; i++) this.numbers.push(this.add.sprite(0, 0, "numbers", 0).setOrigin(0.5, 0))

        this.speedomoter = this.add.sprite(0, 0, "speedomoter").setOrigin(0.5, 1)
        this.speedomoterNeedle = this.add.sprite(0, 0, "speedomoterNeedle").setOrigin(0.16, 0.5)
    }

    physicsUpdate(time, dt) {

        let digits = ParseDigits(World.gameScore, this.numDigits)
        for (let i = 0; i < this.numDigits; i++)
            this.numbers[i].setFrame(digits[i])
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000

        let wid = World.screenWidth
        let hei = World.screenHeight
        let cx = wid / 2
        let cy = hei / 2
        let unit = World.screenUnit

        this.speedomoter.setPosition(wid - 110*unit, hei - 5*unit)
        this.speedomoter.setDisplaySize(200*unit, 120*unit)

        this.speedomoterNeedle.setPosition(wid - 110*unit, hei - 24*unit)
        this.speedomoterNeedle.setDisplaySize(120*unit, 200*unit)
        let speed = Math.sqrt(World.carSpeedSquared)
        let angle = speed * Math.PI / 80
        this.speedomoterNeedle.setRotation(Math.PI + angle)

        for (let i = 0; i < this.numDigits; i++) {
            let wid = 24 * unit
            let hei = 36 * unit

            this.numbers[i].setPosition(cx + (2*i + 1 - this.numDigits) * wid / 2, 10 * unit)
            this.numbers[i].setDisplaySize(wid, hei)
        }


    }
}