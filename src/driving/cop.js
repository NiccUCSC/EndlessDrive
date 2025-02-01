class Cop extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture="cop") {
        super(scene.matter.world, 0, 0, texture)
        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)
        this.setPosition(x, y-16)
        this.setFriction(8)             // Increase ground friction
        this.setFrictionStatic(0.8)     // Make it harder to start moving
        this.setFrictionAir(25)          // Increase air resistance
        this.setBounce(0.8)
        this.name = "cop"
    }

    update(time, dt) {
        let speed = Math.sqrt(this.body.velocity.x**2 + this.body.velocity.y**2) / 16
        // this.setFrictionAir(World.downKey.isDown ? 10 : 1)


        // let fowardForce = 0.8 * (World.upKey.isDown - (speed > 1) * World.downKey.isDown)
        // let turnForce = (World.rightKey.isDown - World.leftKey.isDown)
        // turnForce *= (speed / 15)*1.7



        let car = this.scene.car
        let pos = new Phaser.Math.Vector2(this.x, this.y)
        let carPos = new Phaser.Math.Vector2(car.x, car.y)

        let dir = new Phaser.Math.Vector2(Math.cos(this.rotation), Math.sin(this.rotation))
        let targetDir = carPos.clone().subtract(pos)

        let rotation = this.rotation
        let targetRotation = targetDir.angle()

        let deltaRotation = targetRotation - rotation
        if (deltaRotation < -Math.PI) deltaRotation += 2 * Math.PI
        if (deltaRotation > Math.PI) deltaRotation -= 2 * Math.PI


        let distToCar = targetDir.length() / 16
        let driveForce = distToCar * 0.3 + 10

        let turnForce = Math.max(Math.min(deltaRotation, Math.PI / 6), -Math.PI / 6)
        turnForce *= driveForce * 0.2 + 10

        let fowardForce = driveForce



        let tanVec = new Phaser.Math.Vector2(dir.x, dir.y).setLength(fowardForce)
        let perVec = new Phaser.Math.Vector2(-dir.y, dir.x).setLength(turnForce)


        // console.log(tan)

        this.applyForce(tanVec)
        this.applyForce(perVec)


        // this.applyForce(min(disp.scale(1/200), 5))

        let newVel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y)
        this.rotation = newVel.angle()
    }
}
