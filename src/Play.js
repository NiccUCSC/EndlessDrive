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
        this.car = new Car(this, 0, 0)

        // RoadTile.createTest()

        const tile = new RoadTile(0, 0)
        tile.generateNext()

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