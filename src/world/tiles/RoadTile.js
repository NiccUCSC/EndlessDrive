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
            if (this.generation - curr.generation < 2) return   // dont override parents
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
        RoadTile.alive.delete(this)
        super.destroy()
        // console.log(RoadTile.alive)
    }

}