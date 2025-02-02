class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        // useful variables
        this.ballStartPos = [width/2, height - height/10]
        World.init(this)

        this.world = planck.World(planck.Vec2(0, 0)) // Gravity
        this.worldTimeSinceUpdate = 0
        this.worldUpdateTime = 1 / 64
        this.worldTimeScale = 1.54

    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('grass', 'grass.jpg')
        this.load.image('cup', 'cup.jpg')
        this.load.image('ball', 'ball.png')
        this.load.image('wall', 'wall.png')
        this.load.image('oneway', 'one_way_wall.png')
        this.load.image('car', 'RedRaceCar.png')
        this.load.image('cop', 'cop.png')
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
        // this.cop = new Cop(this, -2000, 0)

        // RoadTile.createTest()

        const tile = new RoadTile(0, 0)
        tile.generateNext()

        // RoadTile.getTileAt(1, 0).generateNext()
        // RoadTile.getTileAt(2, 0).generateNext()
        // RoadTile.getTileAt(1, 0).generateNext()
        // RoadTile.getTileAt(0, 0).generateNext()

        WorldCamera.init(this)
        WorldCamera.startFollow(this.car)


        this.matter.world.on('collisionstart', (event) => {
            let isCar = body => { return body.gameObject instanceof Car }
            let isTile = body => { return body.parentTile instanceof RoadTile }
            event.pairs.forEach(pair => {
                if (isCar(pair.bodyA) && isTile(pair.bodyB)) pair.bodyB.parentTile.generateNext()
                if (isCar(pair.bodyB) && isTile(pair.bodyA)) pair.bodyA.parentTile.generateNext()
            })
        })

        console.log(this.world)

        // Create Ground (Static)
        this.ground = this.world.createBody({
            position: planck.Vec2(400 / 30, 580 / 30),
        });
        this.ground.createFixture(planck.Box(400 / 30, 10 / 30));

        // Create a Box (Dynamic)
        this.boxBody = this.world.createBody({
            type: "dynamic",
            position: planck.Vec2(400 / 30, 100 / 30),
        });
        this.boxBody.createFixture(planck.Box(20 / 30, 20 / 30), { density: 1.0, friction: 0.3 });

        // Add Phaser Sprite
        this.boxSprite = this.add.image(400, 100, "box").setScale(0.5);


    }

    physicsUpdate(time, dt) {       // time since last update, world step time
        this.car.physicsUpdate(time, dt)
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000
        this.matter.world.engine.timing.timeScale = dt * World.TimeScale


        this.worldTimeSinceUpdate += dt * this.worldTimeScale
        while (this.worldTimeSinceUpdate > this.worldUpdateTime) {
            this.worldTimeSinceUpdate -= this.worldUpdateTime

            this.physicsUpdate(this.worldTimeSinceUpdate, this.worldUpdateTime)

            this.world.step(this.worldUpdateTime); // Run physics simulation
        }


        this.car.update(time, dt)
        // this.cop.update(time, dt)

        WorldCamera.update(time, dt)

        RoadTile.update(time, dt)
    }
}
