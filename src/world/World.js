class World {
    static TimeScale = 1

    static init(playScene) {
        this.PlayScene = playScene

        this.interactKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        this.debugKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        this.deselectKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        this.altKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT)
        this.shiftKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
        
        this.upKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.downKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.leftKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.rightKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

        this.debugKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        this.timeScaleUpKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
        this.timeScaleDownKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA)
    
        this.debugKey.on('down', () => {
            playScene.debugMode = !playScene.debugMode
            if (!playScene.debugMode) playScene.debugGraphics.clear()
            console.log(`Debug Mode = ${playScene.debugMode}`)
        })
    
        this.timeScaleUpKey.on('down', () => {
            playScene.worldTimeScale += 1 / 8
            console.log(`TIME SCALE = ${playScene.worldTimeScale}`)
        })
    
        this.timeScaleDownKey.on('down', () => {
            playScene.worldTimeScale -= 1 / 8
            console.log(`TIME SCALE = ${playScene.worldTimeScale}`)
        })
        
    }

}