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
    }

}