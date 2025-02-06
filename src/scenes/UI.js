class UI extends Phaser.Scene {
    constructor() {
        super('uiScene')
    }

    init() {
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.spritesheet('number', 'numbers.png', {
            frameWidth: 16, // Width of each frame
            frameHeight: 24, // Height of each frame
        })
    }

    create() {
        this.add.tilemap()
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000

        console.log("HER")
    }
}