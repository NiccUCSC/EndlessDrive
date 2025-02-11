class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene')
    }

   
    create() {
        this.screenHeight = this.cameras.main.height
        this.backgroudImage = this.add.sprite(0, 0, 'menubackgroud')
        this.backgroudImage.setOrigin(0.5, 0.5)

        World.initMenu(this)
        
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000

        let wid = this.cameras.main.width
        let hei = this.cameras.main.height

        let imgAspect = 483 / 249

        let vsize = Math.min(hei, wid/imgAspect)

        this.backgroudImage.setPosition(wid/2, hei/2)
        this.backgroudImage.setDisplaySize(vsize*imgAspect, vsize)

        if (World.babyDifficulty.isDown) World.difficulty = 0
        if (World.easyDifficulty.isDown) World.difficulty = 1
        if (World.normalDifficulty.isDown) World.difficulty = 2
        if (World.hardDifficulty.isDown) World.difficulty = 3
        if (World.insaneDifficulty.isDown) World.difficulty = 4

        if (World.babyDifficulty.isDown || World.easyDifficulty.isDown || World.normalDifficulty.isDown || World.hardDifficulty.isDown || World.insaneDifficulty.isDown) {
            this.scene.start('playScene')
        }
    }
}