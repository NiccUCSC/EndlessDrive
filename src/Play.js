class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        // useful variables
        this.ballStartPos = [width/2, height - height/10]
        World.init(this)
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('grass', 'grass.jpg')
        this.load.image('cup', 'cup.jpg')
        this.load.image('ball', 'ball.png')
        this.load.image('wall', 'wall.png')
        this.load.image('oneway', 'one_way_wall.png')
        this.load.image('car', 'RedRaceCar.png')
        this.load.image('road', 'road.png')

        this.load.image('tileset', 'ExtrudedTileMap1.png')
        this.load.path = './assets/tiles/'
        this.load.tilemapTiledJSON('tile_straight_road', 'StraightRoad.tmj')

        this.load.tilemapTiledJSON('tileStraightRoad', 'StraightRoad01.tmj')
        this.load.tilemapTiledJSON('tileIntersectionRoad', 'IntersectionRoad01.tmj')
        this.load.tilemapTiledJSON('multiroad', 'MultiRoad.tmj')
    }

    create() {
        this.car = new Car(this, 256, 256)
        // const tileA = new StraightTile(0, 0)
        // const tileB = new IntersectionTile(0, 1)

        // for (let i = 0; i < 100; i++) {
        //     let x = i % 10
        //     let y = (i - x) / 10
        //     new IntersectionTile(x + 3, y + 3)
        // }

        RoadTile.createTest()

        WorldCamera.init(this)
        WorldCamera.startFollow(this.car)
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000
        this.matter.world.engine.timing.timeScale = dt * World.TimeScale


        this.car.update(time, dt)
        WorldCamera.update(time, dt)
    }
}
/*
CODE CHALLENGE
Try to implement at least 3/4 of the following features during the remainder of class (hint: each takes roughly 15 or fewer lines of code to implement):
[ ] Add ball reset logic on successful shot
[ ] Improve shot logic by making pointer’s relative x-position shoot the ball in correct x-direction
[ ] Make one obstacle move left/right and bounce against screen edges
[ ] Create and display shot counter, score, and successful shot percentage
*/