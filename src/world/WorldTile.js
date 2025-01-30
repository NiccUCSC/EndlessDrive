class WorldTile {
    static gridSize = 32
    static tileSize = 16
    static gridPixelSize = WorldTile.tileSize * WorldTile.gridSize

    constructor(scene) {
        this.scene = scene
        this.layers = {}

        this.map = scene.make.tilemap({
            width: WorldTile.gridSize,  // Map width in tiles
            height: WorldTile.gridSize, // Map height in tiles
            tileWidth: WorldTile.tileSize,  // Tile width in pixels
            tileHeight: WorldTile.tileSize, // Tile height in pixels
        })

        this.tiles = this.map.addTilesetImage("road")

        this.createLayer("ground")

        this.layers["ground"].fill(0, 0, 0, this.map.width, this.map.height)

        console.log(this)
    }

    createLayer(layerName) {
        this.layers[layerName] = this.map.createBlankLayer(layerName, this.tiles, 0, 0)
    }

}