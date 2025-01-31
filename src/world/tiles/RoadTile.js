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

    static createTest() {
        for (let i = 0; i < this.types.length; i++) new this(i, 0, this.types[i])
    }

    constructor(x, y, layer="intersection") {
        super(x, y, "multiroad", layer)

        this.worldPos = [x, y]  // tile coordinates

        this.connections = RoadTile.connections[layer] || [0, 0, 0, 0]
    }

    generateNext() {
        let deltas = [[1, 0], [0, 1], [-1, 0], [0, -1]]

        for (let i = 0; i < 4; i++) {
            const delta = deltas[i]
            let validTiles = []
            for (let tileName of Object.keys(RoadTile.connections)) {
                const tile = RoadTile.connections[tileName]
                if (tile[i]) validTiles.push(tileName)
            }

            
            let nextTile = validTiles[Math.floor(Math.random() * validTiles.length)]

            new RoadTile(this.worldPos[0] + delta[0], this.worldPos[1] + delta[1], nextTile)
        }
    }

}