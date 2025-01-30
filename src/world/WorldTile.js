class WorldTile {
    static gridSize = 32
    static tileSize = 16
    static gridPixelSize = WorldTile.tileSize * WorldTile.gridSize

    constructor(scene) {
        this.scene = scene
        this.map = scene.add.tilemap("tile_straight_road")
        this.map.addTilesetImage("tileset")
  
    }

    // createLayer(layerName) {
    //     this.layers[layerName] = this.map.createBlankLayer(layerName, this.tiles, 0, 0)
    // }

}