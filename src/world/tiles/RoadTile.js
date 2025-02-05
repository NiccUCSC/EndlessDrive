class RoadTile extends WorldTile {
    static connections = {  // [right, down, left, up]
        intersection:       [1, 1, 1, 1],
        straight01:         [1, 0, 1, 0],
        straight02:         [0, 1, 0, 1],
        turn01:             [1, 1, 0, 0],
        turn02:             [0, 1, 1, 0],
        turn03:             [0, 0, 1, 1],
        turn04:             [1, 0, 0, 1],
        emptycliff:         [0, 0, 0, 0],
    }

    static types = ["intersection", "straight01", "straight02", 
                    "turn01", "turn02", "turn03", "turn04", "emptycliff"]
    
    static spawnChances = {}    // contains the spawn chance for every segment
    
    static wallBoxes = {}   // "contains a precomputed list of wall collison boxes for every road type"

    static generation = 0

    static alive = new Set()

    static createTest() {
        for (let i = 0; i < this.types.length; i++) new this(i, 0, this.types[i])
    }

    constructor(x, y, type="intersection") {
        super(x, y, "multiroad", type)

        this.type = type
        this.worldPos = [x, y]  // tile coordinates
        this.connections = RoadTile.connections[type] || [0, 0, 0, 0]
        this.generation = RoadTile.generation
        this.needsToGenerate = false

        RoadTile.alive.add(this)

        this.generateWalls(x, y)

        switch (type) {
        case "intersection":
            if (RoadTile.generation && Math.random() < 0.5) this.scene.generateCop(x * 32, y * 32)
            break
        }

    }

    static init() {
        this.spawnChances = {"intersection": 5,
            "straight01": 10,
            "straight02": 10, 
            "turn01": 5, 
            "turn02": 5, 
            "turn03": 5, 
            "turn04": 5, 
            "emptycliff": 60,
        }

        this.GenerateWallBoxes()
    }

    // precomputes the tile wall hitboxes for every tile type
    static GenerateWallBoxes() {
        let scene = World.PlayScene
        let map = scene.make.tilemap({key: "multiroad", tileWidth: 32, tileHeight: 32})
        let tileset = map.addTilesetImage("Tileset01", "tileset", 16, 16, 1, 2)

        for (let type of this.types) {
            let layer = map.createLayer(type, tileset)

            let wallMap = []
            let wallBoxes = []   // { y * 32 + x = width }

            layer.forEachTile(tile => wallMap[tile.y * 32 + tile.x] = tile.index == 34) 

            let addNewRowBox = (x, y, width) => {
                let height = 1
                let boxBelow = wallBoxes[(y+1) * 32 + x]
                if (boxBelow && boxBelow[0] == width) {
                    delete wallBoxes[(y+1) * 32 + x]
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

            this.wallBoxes[type] = wallBoxes
        }
        map.destroy()
    }

    generateWalls(x, y) {
        this.box2dBody = this.scene.world.createBody({
            type: "static",
            position: planck.Vec2(x * 32, y * 32),
        })
        this.box2dBody.parent = this

        this.enterSensor = this.box2dBody.createFixture({
            shape: planck.Box(13, 13),
            friction: 0,
            restitution: 0,
            isSensor: true,
        })
        this.enterSensor.name = "enterSensor"

        let wallBoxes = RoadTile.wallBoxes[this.type]
        for (let i of Object.keys(wallBoxes)) {
            let x = i % 32
            let y = (i - x) / 32
            let box = wallBoxes[i]
            let bw = box[0]
            let bh = box[1]
            let wall = this.box2dBody.createFixture({
                shape: planck.Box(bw / 2, bh / 2, planck.Vec2(-16 + bw/2 + x, -16 + bh/2 + y)),
                friction: 0,
                restitution: 0,
            })
            wall.name = "wall"
        }
    }

    static getTileAt(x, y) {
        for (let tile of this.alive) {
            if (tile.worldPos[0] == x && tile.worldPos[1] == y) 
                return tile
        }
        return null
    }

    prune() {
        let camTileX = Math.round(WorldCamera.cam.worldView.centerX / 32 / 16)
        let camTileY = Math.round(WorldCamera.cam.worldView.centerY / 32 / 16)
        let x = this.worldPos[0]
        let y = this.worldPos[1]
        let dead = Math.abs(x - camTileX) > 2 || Math.abs(y - camTileY) > 2
        if (dead) this.destroy()
        return dead
    }

    static deleteOld() {
        for (let tile of this.alive) tile.prune()                
    }

    static generateAt(x, y) {
        const curr = this.getTileAt(x, y)
        if (curr && !curr.prune()) return


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
        let spawnChances = []
        let totalChance = 0
        let isValid = (tile, connections) => {
            for (let i = 0; i < 4; i++)
                if (connections[i] != -1 && connections[i] != tile[i]) return false
            return true
        }

        for (let tileName of Object.keys(RoadTile.connections)) {
            const tile = RoadTile.connections[tileName]
            if (isValid(tile, connections)) {
                validTiles.push(tileName)
                let chance = RoadTile.spawnChances[tileName]
                spawnChances.push(chance)
                totalChance += chance
            }
        }

        if (!validTiles.length) {
            console.warn(`NO VALID TILES WITH CONSTRAINT ${connections}`)
            return
        }

        let randomNumber = Math.random() * totalChance
        let index = -1
        while (randomNumber > spawnChances[++index]) randomNumber -= spawnChances[index]

        let nextTile = validTiles[index]
        new this(x, y, nextTile)
    }

    generateNext() {
        RoadTile.generation++

        let deltas = [[1, 0], [0, 1], [-1, 0], [0, -1],         // 1 step
                      [1, 1], [1, -1], [-1, -1], [-1, 1],       // 2 step
                      [2, 0], [0, 2], [-2, 0], [0, -2],         // 3 step
                      [2, 1], [1, 2], [-2, 1], [1, -2],         // 4 step
                      [2, -1], [-1, 2], [-2, -1], [-1, -2],     // 5 step
                      [2, 2], [2, -2], [-2, -2], [-2, 2],       // 6 step
                    ]   

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

    static physicsUpdate(time, dt) {
        for (let tile of this.alive) {
            if (tile.needsToGenerate) {
                tile.generateNext()
                tile.needsToGenerate = false
            }
        }
        const newTilePos = this.spawnQueue.shift()
        if (newTilePos) this.generateAt(...newTilePos)
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
        this.scene.world.destroyBody(this.box2dBody)
        this.box2dBody = null
        RoadTile.alive.delete(this)
        super.destroy()
    }
}
