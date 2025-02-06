// Code Practice: RNGolf
// Name: 
// Date:

'use strict'

let config = {
    type: Phaser.AUTO,
    pixelArt: true, // Ensures nearest-neighbor scaling globally
    scale: {
        mode: Phaser.Scale.RESIZE, // Fit the game to the screen
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
    },
    scene: [ Play, UI ]
}

let game = new Phaser.Game(config)

let { width, height } = game.config