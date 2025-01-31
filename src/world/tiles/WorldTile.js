class WorldTile {
    static gridSize = 32
    static tileSize = 16
    static gridPixelSize = WorldTile.tileSize * WorldTile.gridSize

    constructor(x, y, key, layer="ground") {
        this.scene = World.PlayScene

        this.map = this.scene.make.tilemap({key: key, tileWidth: 32, tileHeight: 32})
        this.tileset = this.map.addTilesetImage("Tileset01", "tileset", 16, 16, 1, 2)
        this.layer = this.map.createLayer(layer, this.tileset)

        this.body = World.PlayScene.matter.add.rectangle(
            x * WorldTile.gridPixelSize, y * WorldTile.gridPixelSize, 
            WorldTile.gridPixelSize, WorldTile.gridPixelSize, 
            { isStatic: true,
                isSensor: true,
             } // Set to true if the tile shouldn't move
        )
        this.setPosition(x, y)

        console.log(this.layer)
    }

    setPosition(x, y) {
        this.layer.setPosition((x-0.5) * WorldTile.gridPixelSize, (y-0.5) * WorldTile.gridPixelSize)
    }

    // setRotation(dir) {
    //     this.layer.setRotation(Math.PI * dir / 2)
    // }


    destroy() {
        this.map.destroy()
    }

}