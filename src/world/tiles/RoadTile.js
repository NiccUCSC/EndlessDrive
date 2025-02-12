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

    static alive = new Set()

    static createTest() {
        for (let i = 0; i < this.types.length; i++) new this(i, 0, this.types[i])
    }

    constructor(x, y, type="intersection") {
        super(x, y, "multiroad", type)

        this.type = type
        this.worldPos = [x, y]  // tile coordinates
        this.connections = RoadTile.connections[type] || [0, 0, 0, 0]
        this.needsToGenerate = false

        RoadTile.alive.add(this)

        this.generateWalls(x, y)

        this.skidGraphics = World.PlayScene.add.graphics().setDepth(1)          // updated every physics tick
        this.tempSkidGraphics = World.PlayScene.add.graphics().setDepth(2)      // updated to show potential skid from current tick

        let chance = World.randomGen.frac()
        if (World.PlayScene.cops.length < 2) chance /= 5
        if ((x || y) && chance < RoadTile.copChances[type]) {
            let tx = World.randomGen.frac() * 10 - 5
            let ty = World.randomGen.frac() * 10 - 5
            this.scene.generateCop(x*32+tx, y*32+ty)
        }

        let repairKitChance = World.randomGen.frac()
        if ((x || y) && (type != "emptycliff") && repairKitChance < 0.3) {
            console.log(type)
            let tx = World.randomGen.frac() * 10 - 5
            let ty = World.randomGen.frac() * 10 - 5
            let itemType = World.randomGen.frac() < 2/3 ? RepairKit : WheelRepair
            this.scene.generateItem(x*32+tx, y*32+ty, itemType)
        }

    }

    static init() {
        this.spawnChances = {
            "intersection": 5,
            "straight01": 10,
            "straight02": 10, 
            "turn01": 5, 
            "turn02": 5, 
            "turn03": 5, 
            "turn04": 5, 
            "emptycliff": 60,
        }

        this.copChances = {
            "intersection": 0.8,
            "straight01": 0.2,
            "straight02": 0.2, 
            "turn01": 0.1, 
            "turn02": 0.1, 
            "turn03": 0.1, 
            "turn04": 0.1, 
            "emptycliff": 0,
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

    static getTileAtWorld(x, y) {
        let tx = Math.round(x / 32)
        let ty = Math.round(y / 32)
        return this.getTileAt(tx, ty)
    }



    prune() {
        let playerPos = World.PlayScene.car.box2dBody.getPosition()
        let playerTileX = Math.round(playerPos.x / 32)
        let playerTileY = Math.round(playerPos.y / 32)

        let x = this.worldPos[0]
        let y = this.worldPos[1]
        let dead = Math.abs(x - playerTileX) > 2 || Math.abs(y - playerTileY) > 2
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

        let randomNumber = World.randomGen.frac() * totalChance
        let index = -1
        while (randomNumber > spawnChances[++index]) randomNumber -= spawnChances[index]

        let nextTile = validTiles[index]
        new this(x, y, nextTile)
    }

    generateNext() {
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

    static emptySpawnQueue() {
        let newTilePos
        while(newTilePos = this.spawnQueue.shift()) this.generateAt(...newTilePos)
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

    drawSkidMarks(x0, y0, theta0, x1, y1, theta1, alpha, temporary = false) {
        if (x0 == x1 && y0 == y1) return

        let cw = 0.75                  // car width
        let ch = 1.5                // car length


        let graphicTarget = temporary ? this.tempSkidGraphics : this.skidGraphics
        if (temporary) for (let tile of RoadTile.alive) tile.tempSkidGraphics.clear()

        let drawLine = (a, b, c, d) => {
            graphicTarget.lineStyle(4, 0x000000, alpha*alpha*alpha*0.3)// Black color with alpha transparency
            graphicTarget.beginPath()
            graphicTarget.moveTo(a*16, b*16)
            graphicTarget.lineTo(c*16, d*16)
            graphicTarget.strokePath()
            graphicTarget.closePath()
        }

        let tx0 = Math.cos(theta0)       // previous tangent to car direction x
        let ty0 = Math.sin(theta0)       // previous tangent y
        let tx1 = Math.cos(theta1)       // current tangent x
        let ty1 = Math.sin(theta1)       // current tangent y
        let px0 = -ty0              // previous perpendicular x
        let py0 = tx0               // previous perpendicular y
        let px1 = -ty1              // current perpendicular x
        let py1 = tx1               // current perpendicular y

        for (let dtdp of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
            let dt = dtdp[0] * ch / 2       // tangential component of offset
            let dp = dtdp[1] * cw / 2      // perpendicular component of offset
            drawLine(x0 + dp*px0 + dt*tx0, y0 + dp*py0 + dt*ty0, 
                x1 + dp*px1 + dt*tx1, y1 + dp*py1 + dt*ty1)            
            // drawLine(x0, y0, x1, y1)
        }
    }

    despawnCopsAndItems() {
        for (let obj of [...this.scene.cops, ...this.scene.items]) {
            let pos = obj.box2dBody.getPosition()
            if (RoadTile.getTileAtWorld(pos.x, pos.y) == this) obj.destroy()
        }
    }

    destroy() {
        this.despawnCopsAndItems()
        this.scene.world.destroyBody(this.box2dBody)
        this.box2dBody = null
        this.skidGraphics.destroy()
        this.tempSkidGraphics.destroy()
        RoadTile.alive.delete(this)
        super.destroy()
    }

    static destroy_all() {
        for (let tile of [...this.alive]) tile.destroy()
        this.spawnQueue = []
    }
}