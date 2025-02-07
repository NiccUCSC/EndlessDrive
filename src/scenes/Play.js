class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        World.init(this)

        this.world = planck.World(planck.Vec2(0, 0)) // Gravity
        this.worldTimeSinceUpdate = 0
        this.worldUpdateTime = 1 / 64
        this.worldTimeScale = 1
        this.world.on("begin-contact", this.onBeginContact)
        this.world.on("end-contact", this.onEndContact)

        this.debugGraphics = this.add.graphics()
        this.VEHICAL_CATEGORY = 0x0001
        this.COP_CAR_CATEGORY = 0x0002
        this.WHEEL_CATEGORY = 0x0004
        this.SURFACE_CATEGORY = 0x0008
        this.FIXED_CATEGORY = 0x0010
        this.PLAYER_CATEGORY = 0x0020
        this.debugMode = false
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('grass', 'grass.jpg')
        this.load.image('cup', 'cup.jpg')
        this.load.image('ball', 'ball.png')
        this.load.image('wall', 'wall.png')
        this.load.image('oneway', 'one_way_wall.png')
        // this.load.image('car', 'RedRaceCar.png')
        this.load.image('cop', 'CopCar.png')
        this.load.image('road', 'road.png')
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

        this.load.tilemapTiledJSON('tileStraightRoad', 'StraightRoad01.tmj')
        this.load.tilemapTiledJSON('tileIntersectionRoad', 'IntersectionRoad01.tmj')
        this.load.tilemapTiledJSON('multiroad', 'MultiRoad.tmj')
        
    }

    create() {
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explodeSheet', { start: 0, end: 9 }),
            frameRate: 8,
            repeat: 0
        })

        World.preLoad()
        World.loadGame(this)

        this.scene.launch('uiScene')
    }


    onBeginContact(contact) {
        const fixtureA = contact.getFixtureA()
        const fixtureB = contact.getFixtureB()
        const bodyA = fixtureA.getBody()
        const bodyB = fixtureB.getBody()
        const objectA = bodyA.parent
        const objectB = bodyB.parent
        const velocityA = bodyA.getLinearVelocity()
        const velocityB = bodyB.getLinearVelocity()
        const relativeVelocity = velocityA.clone().sub(velocityB)

        // const manifold = contact.getManifold()
        // const normal = manifold.localNormal
        // // const impactVelocity = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y
        const impactVelocity = Math.sqrt(relativeVelocity.x**2 + relativeVelocity.y**2)

    
        // // Calculate the impact velocity (dot product of relative velocity and contact normal)
        // const impactVelocity = relativeVelocity.dot(normal)

        let getInstance = (type) => {
            if (objectA instanceof type) return {obj: objectA, fix: fixtureA}
            if (objectB instanceof type) return {obj: objectB, fix: fixtureB}
            return null
        }

        let values = { RoadTile: 0x1, Car: 0x2, Cop: 0x4 }
        let tile = getInstance(RoadTile)
        let car = getInstance(Car)
        let cop = getInstance(Cop)
        let key = !!tile * values.RoadTile | !!car * values.Car | !!cop * values.Cop

        switch (key) {
        case values.RoadTile | values.Car:
            switch (tile.fix.name) {
            case "enterSensor":
                // console.log(`CAR ENTER TILE <${tile.obj.worldPos[0]}, ${tile.obj.worldPos[1]}>`)
                tile.obj.needsToGenerate = true
                break
            case "wall":
                // console.log("CAR HIT WALL")
                car.obj.impact(impactVelocity, "wall")
                break   
            }
            break
        case values.RoadTile | values.Cop:
            switch (tile.fix.name) {
            case "enterSensor":
                break
            case "wall":
                // console.log("COP HIT WALL")
                cop.obj.impact(impactVelocity, "wall")
                break   
            }
            break
        case values.Cop | values.Car:
            // console.log("COP HIT CAR")
            cop.obj.impact(impactVelocity, "car")
            car.obj.impact(impactVelocity, "cop")
            car.obj.addCollide(cop.obj)
            break
        }
    }

    onEndContact(contact) {
        const fixtureA = contact.getFixtureA()
        const fixtureB = contact.getFixtureB()
        const objectA = fixtureA.getBody().parent
        const objectB = fixtureB.getBody().parent

        let getInstance = (type) => {
            if (objectA instanceof type) return {obj: objectA, fix: fixtureA}
            if (objectB instanceof type) return {obj: objectB, fix: fixtureB}
            return null
        }

        let values = { RoadTile: 0x1, Car: 0x2, Cop: 0x4 }
        let tile = getInstance(RoadTile)
        let car = getInstance(Car)
        let cop = getInstance(Cop)
        let key = !!tile * values.RoadTile | !!car * values.Car | !!cop * values.Cop

        switch (key) {
        case values.Cop | values.Car:
            console.log("COP UNHIT CAR")
            car.obj.removeCollide(cop.obj)
            break
        }
    }

    generateCop(x, y) {
        this.cops.add(new Cop(this, x, y))
    }

    physicsUpdate(time, dt) {       // time since last update, world step time
        if (this.car) this.car.physicsUpdate(time, dt)
        for (let cop of this.cops) cop.physicsUpdate(time, dt)
        RoadTile.physicsUpdate(time, dt)
        World.physicsUpdate(time, dt)
    }

    update(time, dt) {
        time /= 1000
        dt /= 1000
        World.update(time, dt)

        this.worldTimeSinceUpdate += dt * this.worldTimeScale
        while (this.worldTimeSinceUpdate > this.worldUpdateTime) {
            this.worldTimeSinceUpdate -= this.worldUpdateTime
            this.physicsUpdate(this.worldTimeSinceUpdate, this.worldUpdateTime)
            this.world.step(this.worldUpdateTime) // Run physics simulation
            if (this.debugMode) drawDebugGraphics()
        }

        if (this.car) this.car.update(time, dt)
        for (let cop of this.cops) cop.update(time, dt)

        WorldCamera.update(time, dt)
    }

    onGameOver() {
        World.PlayScene.worldTimeScale *= 0.25
        console.log("GAME OVER")

    }
}