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
        this.worldTimeScale = 1
        this.world.on("begin-contact", this.onBeginContact)

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
        this.load.image('car', 'RedRaceCar.png')
        this.load.image('cop', 'CopCar.png')
        this.load.image('road', 'road.png')

        this.load.image('tileset', 'ExtrudedTileMap1.png')
        this.load.path = './assets/tiles/'
        this.load.tilemapTiledJSON('tile_straight_road', 'StraightRoad.tmj')

        this.load.tilemapTiledJSON('tileStraightRoad', 'StraightRoad01.tmj')
        this.load.tilemapTiledJSON('tileIntersectionRoad', 'IntersectionRoad01.tmj')
        this.load.tilemapTiledJSON('multiroad', 'MultiRoad.tmj')
    }

    create() {
        RoadTile.init()

        this.car = new Car(this, 0, 0)
        this.cops = new Set([
            new Cop(this, -40, 0),
        ])


        // RoadTile.createTest()
        const tile = new RoadTile(0, 0)
        // tile.generateNext()

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


    }

    onBeginContact(contact) {
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
        case values.RoadTile | values.Car:
            switch (tile.fix.name) {
            case "enterSensor":
                console.log(`CAR ENTER TILE <${tile.obj.worldPos[0]}, ${tile.obj.worldPos[1]}>`)
                break
            case "wall":
                console.log("CAR HIT WALL")
                break   
            }
            break
        case values.Cop | values.Car:
            console.log("COP HIT CAR")
            break
        }
    }

    generateCop(x, y) {
        this.cops.add(new Cop(this, x, y))
    }

    physicsUpdate(time, dt) {       // time since last update, world step time
        this.car.physicsUpdate(time, dt)
        for (let cop of this.cops) cop.physicsUpdate(time, dt)
        RoadTile.physicsUpdate(time, dt)
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
            if (this.debugMode) drawDebugGraphics(this, this.world, this.debugGraphics)
        }


        this.car.update(time, dt)
        for (let cop of this.cops) cop.update(time, dt)

        WorldCamera.update(time, dt)
    }
}

// Chat GPT debug function
function drawDebugGraphics(scene, world, graphics) {
    graphics.clear()
    graphics.depth = 1000

    // Iterate over all Box2D bodies
    for (let body = world.getBodyList(); body; body = body.getNext()) {
        const pos = body.getPosition();
        const angle = body.getAngle(); // Get body's rotation in radians


        // Convert Box2D world coordinates to Phaser pixels (1m = 16px)
        const x = pos.x * 16;
        const y = pos.y * 16;

        for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
            if (fixture.isSensor() == true) {
                graphics.lineStyle(1, 0xff00ff, 1)
                graphics.fillStyle(0xff00ff, 0.2)
            } else {
                graphics.lineStyle(1, 0x00ff00, 1)
                graphics.fillStyle(0x00ff00, 0.2)
            }

            const shape = fixture.getShape();

            if (shape.getType() === 'polygon') { // Polygons & Boxes
                const vertices = shape.m_vertices.map(v => {
                    // Rotate the vertex around (0,0) and apply body's position
                    const rotatedX = v.x * Math.cos(angle) - v.y * Math.sin(angle);
                    const rotatedY = v.x * Math.sin(angle) + v.y * Math.cos(angle);

                    return {
                        x: (rotatedX + pos.x) * 16, 
                        y: (rotatedY + pos.y) * 16
                    };
                });

                graphics.beginPath();
                graphics.moveTo(vertices[0].x, vertices[0].y);

                for (let i = 1; i < vertices.length; i++) {
                    graphics.lineTo(vertices[i].x, vertices[i].y);
                }

                graphics.closePath();
                graphics.strokePath();
                graphics.fillPath();
            }
            else if (shape.getType() === 'circle') { // Circles
                const radius = shape.m_radius * 16;
                graphics.strokeCircle(x, y, radius);
                graphics.fillCircle(x, y, radius);
            }
        }
    }
}
