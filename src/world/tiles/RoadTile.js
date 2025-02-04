class RoadTile extends WorldTile {
    static connections = {  // [right, down, left, up]
        intersection: [1, 1, 1, 1],
        straight01: [1, 0, 1, 0],
        straight02: [0, 1, 0, 1],
        turn01: [1, 1, 0, 0],
        turn02: [0, 1, 1, 0],
        turn03: [0, 0, 1, 1],
        turn04: [1, 0, 0, 1],
    }

    static types = ["intersection", "straight01", "straight02", 
                    "turn01", "turn02", "turn03", "turn04"]

    static generation = 0

    static alive = new Set()

    static createTest() {
        for (let i = 0; i < this.types.length; i++) new this(i, 0, this.types[i])
    }

    constructor(x, y, layer="intersection") {
        super(x, y, "multiroad", layer)

        this.worldPos = [x, y]  // tile coordinates

        this.connections = RoadTile.connections[layer] || [0, 0, 0, 0]

        this.generation = RoadTile.generation

        RoadTile.alive.add(this)

        // generateTileCollisionBoxes(this, x, y, layer)

        this.generateWalls(x, y)

        if (RoadTile.generation && Math.random() < 0.1) this.scene.generateCop(x * 32, y * 32)
    }

    generateWalls(x, y) {
        this.box2dBody = this.scene.world.createBody({
            type: "static",
            position: planck.Vec2(x * 32, y * 32),
        })

        this.box2dBody.createFixture({
            shape: planck.Box(13, 13),
            friction: 0,
            restitution: 0,
            isSensor: true,
        })

        let wallMap = []
        let wallBoxes = []   // { y * 32 + x = width }
        for (let y = 0; y < 32; y++) wallMap

        this.layer.forEachTile(tile => {
            wallMap[tile.y * 32 + tile.x] = tile.index == 34
        })

        let addNewRowBox = (x, y, width) => {
            let height = 1
            let boxBelow = wallBoxes[(y+1) * 32 + x]
            if (boxBelow && boxBelow[0] == width) {
                wallBoxes[(y+1) * 32 + x] = null
                height = boxBelow[1] + 1
            }
            wallBoxes[y * 32 + x] = [width, height]
        }

        for (let y = 32 - 1; y >= 0; y--) {
            let boxStartX = -1
            let x = 0
            for (; x < 32; x++) {
                if (wallMap[y * 32 + x] && boxStartX == -1) boxStartX = x           // start the box
                if (!wallMap[y * 32 + x] && boxStartX != -1) {
                    addNewRowBox(boxStartX, y, x - boxStartX)                   // close the box
                    boxStartX = -1
                }
            }
            if (boxStartX != -1) addNewRowBox(boxStartX, y, x - boxStartX)   // close the box
        }
        
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                let box = wallBoxes[y * 32 + x]
                if (box) {
                    let bw = box[0]
                    let bh = box[1]
                    this.box2dBody.createFixture({
                        shape: planck.Box(bw / 2, bh / 2, planck.Vec2(-16 + bw/2 + x, -16 + bh/2 + y)),
                        friction: 0,
                        restitution: 0,
                    })
                }

            }
        }


    }

    static getTileAt(x, y) {
        for (let tile of this.alive) {
            if (tile.worldPos[0] == x && tile.worldPos[1] == y) 
                return tile
        }

        return null
    }

    static deleteOld() {
        for (let tile of this.alive)
            if (this.generation - tile.generation > 4) 
                tile.destroy()
    }

    static generateAt(x, y) {
        const curr = this.getTileAt(x, y)
        if (curr) {                                             // if tile is occupied
            if (this.generation - curr.generation < 3) return   // dont override parents
            else curr.destroy()                                 // remove curr from gene pool
        }

        // get the constraints of the tile
        let connections = [-1, -1, -1, -1]                      // -1 means free
        let deltas = [[1, 0], [0, 1], [-1, 0], [0, -1]]
        for (let i = 0; i < 4; i++) {
            const delta = deltas[i]
            const neighbor = this.getTileAt(x + delta[0], y + delta[1])
            if (!neighbor) continue
            connections[(i+2) % 4] = neighbor.connections[i]
        }

        let validTiles = []
        let isValid = (tile, connections) => {
            for (let i = 0; i < 4; i++)
                if (connections[i] != -1 && connections[i] != tile[i]) return false
            return true
        }

        for (let tileName of Object.keys(RoadTile.connections)) {
            const tile = RoadTile.connections[tileName]
            if (isValid(tile, connections)) validTiles.push(tileName)
        }

        if (!validTiles.length) {
            console.warn(`NO VALID TILES WITH CONSTRAINT ${connections}`)
            return
        }

        let nextTile = validTiles[Math.floor(Math.random() * validTiles.length)]
        new this(x, y, nextTile)
    }

    generateNext() {
        RoadTile.generation++

        let deltas = [[1, 0], [0, 1], [-1, 0], [0, -1],     // 1 step
                      [1, 1], [1, -1], [-1, -1], [-1, 1]]   // 2 step

        for (let delta of deltas) {
            RoadTile.addToSpawnQueue([this.worldPos[0] + delta[0], this.worldPos[1] + delta[1]])

        }

        RoadTile.deleteOld()
    }

    static spawnQueue = []      // stores tiles waiting to be generated
    static spawnRate = 800       // maximum new tile spawnrate
    static timeTillSpawn = 0    // time in seconds till next spawn

    static addToSpawnQueue(pos) {
        for (let elem of this.spawnQueue) if (pos[0] == elem[0] && pos[1] == elem[1]) return
        this.spawnQueue.push(pos)
    }

    static update(time, dt) {
        this.timeTillSpawn -= dt
        if (this.timeTillSpawn <= 0) {
            this.timeTillSpawn += 1 / this.spawnRate
            const newTilePos = this.spawnQueue.shift()
            if (newTilePos) this.generateAt(...newTilePos)
        }

    }


    destroy() {
        // console.log(this)
        this.scene.world.destroyBody(this.box2dBody)
        this.box2dBody = null

        RoadTile.alive.delete(this)
        super.destroy()
        // console.log(RoadTile.alive)
    }

}

function generateTileCollisionBoxes(tile, x, y, type) {
    tile.box2dBody = tile.scene.world.createBody({
        type: "static",
        position: planck.Vec2(x * 32, y * 32),
    })

    let body = tile.box2dBody

    body.createFixture({
        shape: planck.Box(13, 13),
        friction: 0,
        restitution: 0,
        isSensor: true,
    })

    let connections = RoadTile.connections[type]
    if (!connections[0]) addWall1(body)
    else                 addOpening1(body)
    if (!connections[1]) addWall2(body)
    else                 addOpening2(body)
    if (!connections[2]) addWall3(body)
    else                 addOpening3(body)
    if (!connections[3]) addWall4(body)
    else                 addOpening4(body)
}

function addWall1(body) {
    body.createFixture({
        shape: planck.Box(1.5, 16, planck.Vec2(-14.5, 0)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addWall2(body) {
    body.createFixture({
        shape: planck.Box(16, 1.5, planck.Vec2(0, -14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addWall3(body) {
    body.createFixture({
        shape: planck.Box(1.5, 16, planck.Vec2(14.5, 0)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addWall4(body) {
    body.createFixture({
        shape: planck.Box(16, 1.5, planck.Vec2(0, 14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}


function addOpening1(body) {
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(-14.5, -14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(-14.5, 14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addOpening2(body) {
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(-14.5, -14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(14.5, -14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addOpening3(body) {
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(14.5, -14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(14.5, 14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}

function addOpening4(body) {
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(-14.5, 14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
    body.createFixture({
        shape: planck.Box(1.5, 1.5, planck.Vec2(14.5, 14.5)),
        friction: 0,
        restitution: 0,
        filterCategoryBits: World.PlayScene.FIXED_CATEGORY,
        isSensor: false,
    })
}