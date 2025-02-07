class UI extends Phaser.Scene {
    constructor() {
        super('uiScene')
    }

    init() {
        World.initUIScene(this)
    }

    preload() {
        this.load.path = './assets/img/'
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
    }

    physicsUpdate(time, dt) {

        let digits = ParseDigits(World.gameScore, this.numDigits)
        for (let i = 0; i < this.numDigits; i++)
            this.numbers[i].setFrame(digits[i])
        console.log(this.numbers)
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000

        let cx = World.screenWidth / 2
        let unit = World.screenUnit


        for (let i = 0; i < this.numDigits; i++) {
            let wid = 24 * unit
            let hei = 36 * unit

            this.numbers[i].setPosition(cx + (2*i + 1 - this.numDigits) * wid / 2, 10 * unit)
            this.numbers[i].setDisplaySize(wid, hei)
        }


    }
}