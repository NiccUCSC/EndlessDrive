class World {
    static TimeScale = 1
    static gameStarted = false
    static gameID = ""
    static gameScore = 0
    static gameDist = 0
    static gamePrevPos = { x: 0, y: 0 }

    static restartDelay = 0.05
    static timeTillRestart = 1
    static randomGen = null // new Phaser.Math.RandomDataGenerator({ seed: 'your-seed-value' })
    static screenWidth = 640
    static screenHeight = 480
    static screenUnit = 640 / 1000
    static carSpeedSquared = 0
    static playerEngineHealth = 0
    static playerWheelsHealth = 0

    static bgMusic = null

    static initUIScene(uiScene) {
        this.UIScene = uiScene
    }

    static init(playScene) {
        this.PlayScene = playScene

        playScene.input.keyboard.on('keydown', (event) => {
            if (!this.gameStarted && this.timeTillRestart == 0 && 
                (this.upKey.isDown || this.downKey.isDown || this.rightKey.isDown || this.leftKey.isDown)
            ) this.startGame(playScene)
        })

        this.interactKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        this.debugKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        this.deselectKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        this.altKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT)
        this.shiftKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
        this.restartKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        
        this.upKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.downKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.leftKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.rightKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

        this.debugKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        this.timeScaleUpKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
        this.timeScaleDownKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA)
        this.zoomInKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET)
        this.zoomOutKey = this.PlayScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET)
    
        this.debugKey.on('down', () => {
            playScene.debugMode = !playScene.debugMode
            if (!playScene.debugMode) playScene.debugGraphics.clear()
            else drawDebugGraphics()
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
    
        this.zoomInKey.on('down', () => {
            WorldCamera.vertTiles = Math.max(WorldCamera.vertTiles - 32, 32)
            console.log(`Vertical Zoom = ${WorldCamera.vertTiles}`)
        })
    
        this.zoomOutKey.on('down', () => {
            WorldCamera.vertTiles = Math.min(WorldCamera.vertTiles + 32, 384)
            console.log(`Vertical Zoom = ${WorldCamera.vertTiles}`)
        })
    
        this.restartKey.on('down', () => {
            this.resetGame(this.PlayScene)
            this.timeTillRestart = this.restartDelay
        })

        // SFX
        this.bgMusic = playScene.sound.add('bgmusic', { loop: true })
        this.bgMusic.play()
        this.bgMusic.setVolume(0.1)

        this.slideSFXs = [
            playScene.sound.add('slide1', { loop: true }),
            playScene.sound.add('slide2', { loop: true }),
            playScene.sound.add('slide3', { loop: true }),
        ]

        for (let i = 0; i < this.slideSFXs.length; i++) {
            this.slideSFXs[i].play()
            this.slideSFXs[i].setVolume(0)
            this.slideSFXs[i].setRate(0.3 + i / 80)
        }

        this.copBonkSFX = playScene.sound.add('copbonk', { loop: false })
    }
    

    static playCopBonk() {
        this.copBonkSFX.play()
        this.copBonkSFX.setVolume(0.1)
    }

    static preLoad() {
        RoadTile.init()
    }

    static physicsUpdate(time, dt) {
        let car = this.PlayScene.car
        let playerVel = car.box2dBody.getLinearVelocity()
        let playerPos = car.box2dBody.getPosition()
        this.carSpeedSquared = playerVel.x*playerVel.x + playerVel.y*playerVel.y
        this.playerEngineHealth = car.health / 100
        this.playerWheelsHealth = car.wheelHealth / 100
        if (this.PlayScene.car.alive) {
            let dx = playerPos.x - this.gamePrevPos.x
            let dy = playerPos.y - this.gamePrevPos.y
            this.gamePrevPos.x = playerPos.x
            this.gamePrevPos.y = playerPos.y
            this.gameDist += Math.sqrt(dx*dx + dy*dy)
            this.gameScore += time *                                                // time
                            (this.gameDist / 1000) *                                // distance
                            this.carSpeedSquared *   // velocity^2
                            this.PlayScene.worldTimeScale                           // timescale
        }
        this.UIScene.physicsUpdate(time, dt)

        this.bgMusic.setRate(this.PlayScene.worldTimeScale)
        let skidPercent = car.skidPercent
        let skidVolume = skidPercent ** 2 * 0.06

        for (let sound of this.slideSFXs) {
            sound.setVolume(skidVolume)
        }
    }

    static update(time, dt) {
        if (this.timeTillRestart > 0) this.timeTillRestart = Math.max(this.timeTillRestart - dt, 0)
        this.screenWidth = this.PlayScene.cameras.main.width
        this.screenHeight = this.PlayScene.cameras.main.height
        this.screenUnit = this.screenHeight / 1000
    }

    static onGameOver() {
        this.bgMusic.setVolume(0.01)
    }

    static loadGame(scene) {
        this.bgMusic.setVolume(0.1)


        this.gameID = generateGameID(5, 5)
        this.randomSeed = stringToSeed(this.gameID)
        // this.randomSeed = 0
        this.randomGen = new Phaser.Math.RandomDataGenerator(this.gameID.split('-'))
        this.gameScore = 0
        this.gameDist = 0
        this.gamePrevPos = { x: 0, y: 0 }
        this.carSpeedSquared = 0
        this.playerEngineHealth = 1
        this.playerWheelsHealth = 1


        console.log(`Game started with ID: ${this.gameID}, Seed: ${this.randomSeed}`)
        scene.car = new Car(scene, 0, 0)    // place car
        scene.cops = new Set()
        scene.items = new Set()
        scene.generateCop(-10, 0)
        WorldCamera.init(scene)
        WorldCamera.startFollow(scene.car)
        let rootTile = new RoadTile(0, 0)                  // place first tile

        rootTile.generateNext()
        RoadTile.emptySpawnQueue()                          // generates all the tiles in spawn queue at once

        scene.worldTimeSinceUpdate = 0
        scene.worldUpdateTime = 1 / 64
        scene.worldTimeScale = 0
    }

    static startGame(scene) {
        this.gameStarted = true
        scene.worldTimeScale = 1
    }

    static resetGame(scene) {
        console.log("RESETTING GAME")
        this.timeTillRestart = this.restartDelay
        this.gameStarted = false
        this.gameID = ""

        let objs = scene.children.getChildren().slice()
        for (let obj of objs) {
            if ((obj instanceof Car) || (obj instanceof Cop) || (obj instanceof Item))
                obj.destroy()
        }
        RoadTile.destroy_all()

        console.log(scene.children.getChildren().slice())

        this.loadGame(scene)
    }

}