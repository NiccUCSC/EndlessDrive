class ScoreText {
    static charWidth = 16
    static charHeight = 24

    constructor(x, y, key, layer="ground") {
        this.xPercent = x
        this.yPercent = y

        this.scene = World.UIScene

        this.map = this.scene.make.tilemap({ width: 10, height: 1, tileWidth: ScoreText.charWidth, tileHeight: ScoreText.charHeight })
        this.tileset = this.map.addTilesetImage("number", null, 16, 24)
        this.layer = this.map.createBlankLayer("TextLayer", this.tileset)
    }

    updateScore(score) {
        const scoreStr = score.toString();

        this.layer.removeAllTiles();

        for (let i = 0; i < scoreStr.length && i < 10; i++) {
            const digit = parseInt(scoreStr.charAt(i));
            this.layer.putTileAt(digit, i, 0);  // (digit, x, y)
        }
    }

    update(time, dt) {
        let x = this.xPercent * World.screenWidth
        let y = this.yPercent * World.screenHeight

        this.map.setPosition(x, y)
    }

    destroy() {
        this.map.destroy()
        this.map = null
    }

}