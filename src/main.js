// Endless Runner: Driftopia Police Chase
// Name: Nicolas Vaillancourt
// Date: 02/10/2025
// Hours: 60+
// Used Box2d physics engine to develop a fixed time step physics system that is consistant across different frame rates
// Developed a random infinite terrain generation system with automatic wall hitbox creation


'use strict'

let config = {
    type: Phaser.AUTO,
    pixelArt: true, // Ensures nearest-neighbor scaling globally
    scale: {
        mode: Phaser.Scale.RESIZE, // Fit the game to the screen
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
    },
    scene: [ Load, Menu, Play, UI ]
}

let game = new Phaser.Game(config)

let { width, height } = game.config