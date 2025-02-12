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
        this.ITEM_CATEGORY = 0x0040
        this.debugMode = false
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
        const impactVelocity = Math.sqrt(relativeVelocity.x**2 + relativeVelocity.y**2)

        let getInstance = (type) => {
            if (objectA instanceof type) return {obj: objectA, fix: fixtureA}
            if (objectB instanceof type) return {obj: objectB, fix: fixtureB}
            return null
        }

        // setment 1
        let values = { RoadTile: 0x1, Car: 0x2, Cop: 0x4, Item: 0x8 }
        let tile = getInstance(RoadTile)
        let car = getInstance(Car)
        let cop = getInstance(Cop)
        let item = getInstance(Item)
        let key = !!tile * values.RoadTile | !!car * values.Car | !!cop * values.Cop | !!item * values.Item

        switch (key) {
        case values.RoadTile | values.Car:
            switch (tile.fix.name) {
            case "enterSensor":
                tile.obj.needsToGenerate = true
                break
            case "wall":
                car.obj.impact(impactVelocity, "wall")
                break   
            }
            break
        case values.RoadTile | values.Cop:
            switch (tile.fix.name) {
            case "enterSensor":
                break
            case "wall":
                cop.obj.impact(impactVelocity, "wall")
                break   
            }
            break
        case values.Cop | values.Car:
            cop.obj.impact(impactVelocity, "car")
            car.obj.impact(impactVelocity, "cop")
            car.obj.addCollide(cop.obj)
            World.playCopBonk()
            break
        case values.Item | values.Car:
            item.obj.onCollect(car.obj)
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
            car.obj.removeCollide(cop.obj)
            break
        }
    }

    generateCop(x, y) {
        this.cops.add(new Cop(this, x, y))
    }

    generateItem(x, y, type) {
        this.items.add(new type(World.PlayScene, x, y))
    }

    physicsUpdate(time, dt) {       // time since last update, world step time
        if (this.car) this.car.physicsUpdate(time, dt)
        for (let cop of this.cops) cop.physicsUpdate(time, dt)
        for (let item of this.items) item.physicsUpdate(time, dt)
        RoadTile.physicsUpdate(time, dt)
        World.physicsUpdate(time, dt)
    }

    afterPhysicsUpdate() {
        this.car.afterPhysicsUpdate()
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
            this.afterPhysicsUpdate()
            if (this.debugMode) drawDebugGraphics()
        }

        if (this.car) this.car.update(time, dt)
        for (let cop of this.cops) cop.update(time, dt)
        for (let item of this.items) item.update(time, dt)

        WorldCamera.update(time, dt)
    }

    onGameOver() {
        WorldCamera.stopFollow()
        World.PlayScene.worldTimeScale *= 0.25
        World.onGameOver()
        console.log("GAME OVER")
    }
}