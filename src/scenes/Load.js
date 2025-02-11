class Load extends Phaser.Scene {
    constructor() {
        super('loadScene')
    }

    preload() {
        let wid = this.cameras.main.width
        let hei = this.cameras.main.height
        let cx = wid / 2
        let cy = hei / 2
        let unit = World.screenUnit

        // loading bar
        // see: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/loader/
        let loadingBar = this.add.graphics()
        this.load.on('progress', (value) => {
            loadingBar.clear();                                 // reset fill/line style
            loadingBar.fillStyle(0xFFFFFF, 1);                  // (color, alpha)
            loadingBar.fillRect(0, cy, wid * value, 5);  // (x, y, w, h)
        })
        this.load.on('complete', () => {
            loadingBar.destroy()
        })

        // SFX
        this.load.path = './assets/sfx/'
        this.load.audio("bgmusic1", "heavy-racing-151129.mp3")
        this.load.audio("bgmusic2", "race-cars-phonk-gaming-music.mp3")
        this.load.audio("bgmusic3", "crazy-race-acid-breakbeat.mp3")
        this.load.audio("bgmusic4", "funny-comedy-cartoon-background-music.mp3")

        this.load.audio("slide1", "rubber-tire-screech-8-202578.mp3")
        this.load.audio("slide2", "rubber-tire-screech-9-202582.mp3")
        this.load.audio("slide3", "rubber-tire-screech-3-202532.mp3")
        this.load.audio("copbonk", "car-door-shut-297266.mp3")
        this.load.audio("fixengine", "fixEngine.mp3")
        this.load.audio("fixtires", "fixTires.mp3")

        this.load.audio("carcrash", "crash-7075.mp3")
        this.load.audio("carexplode", "explosion-6055.mp3")

        // Menu Background
        this.load.path = './assets/img/'
        this.load.image('menubackgroud', "menuBackground2.png")

        // Play scene
        this.load.path = './assets/img/'
        this.load.image('cop', 'CopCar.png')

        this.load.image('repairkit', 'RepairKit.png')
        this.load.image('wheelrepair', 'WheelRepair.png')
        this.load.spritesheet('car', 'RedRaceCarDamages.png', {
            frameWidth: 32, // Width of each frame
            frameHeight: 16, // Height of each frame
        })

        this.load.spritesheet('explodeSheet', 'Explode.png', {
            frameWidth: 64,
            frameHeight: 64,
            startFrame: 0,
            endFrame: 9
        })
        
        this.load.image('tileset', 'ExtrudedTileMap1.png')
        this.load.path = './assets/tiles/'
        this.load.tilemapTiledJSON('tile_straight_road', 'StraightRoad.tmj')

        this.load.tilemapTiledJSON('multiroad', 'MultiRoad.tmj')

        // UI
        this.load.path = './assets/img/'
        this.load.image('speedomoter', 'Speedomoter3.png')
        this.load.image('speedomoterNeedle', 'SpeedomoterNeedle2.png')
        this.load.spritesheet('health', 'Health.png', { frameWidth: 200, frameHeight: 80 })

        this.load.spritesheet('numbers', 'numbers.png', { frameWidth: 16, frameHeight: 24 })
        this.load.spritesheet('letters', 'letters.png', { frameWidth: 16, frameHeight: 24 })
        this.load.spritesheet('controls', 'controls.png', { frameWidth: 32, frameHeight: 24 })    
    }

    create() {
        // check for local storage browser support
        if(window.localStorage) {
            console.log('Local storage supported')
        } else {
            console.log('Local storage not supported')
        }

        // go to Title scene
        this.scene.start('menuScene')
    }
}