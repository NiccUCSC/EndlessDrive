class World {
    

    static init(playScene) {
        World.PlayScene = playScene

        World.interactKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        World.debugKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        World.deselectKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        World.altKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT)
        World.shiftKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
        
        World.upKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        World.downKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        World.leftKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        World.rightKey = World.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }


}