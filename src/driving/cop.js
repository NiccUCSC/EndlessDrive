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
        // this.setFrictionAir(1)          // Increase air resistance
        this.name = "car"
    }

    update(time, dt) {
        let speed = Math.sqrt(this.body.velocity.x**2 + this.body.velocity.y**2) / 16
        // this.setFrictionAir(World.downKey.isDown ? 10 : 1)


        // let fowardForce = 0.8 * (World.upKey.isDown - (speed > 1) * World.downKey.isDown)
        // let turnForce = (World.rightKey.isDown - World.leftKey.isDown)
        // turnForce *= (speed / 15)*1.7



        // let car = this.scene.car
        // let pos = new Phaser.Math.Vector2(this.x, this.y)
        // let carPos = new Phaser.Math.Vector2(car.x, car.y)


        // let dir = new Phaser.Math.Vector2(Math.cos(this.rotation), Math.sin(this.rotation))


        // let distToCar = Math.sqrt(disp[0]*disp[0] + disp[1]*disp[1])
        // let angleToCar = 

        // // let tanVec = new Phaser.Math.Vector2(dir[0], dir[1]).setLength(fowardForce)
        // let perVec = new Phaser.Math.Vector2(-dir[1], dir[0]).setLength(turnForce)

        // // this.applyForce(tanVec)
        // this.applyForce(perVec)


        // this.applyForce(min(disp.scale(1/200), 5))

        // let newVel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y)
        // this.rotation = newVel.angle()
    }
}
