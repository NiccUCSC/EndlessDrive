class Car extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture="car") {
        super(scene.matter.world, x, y, texture)
        scene.add.existing(this)
    }

    update(time, dt) {
        this.setVelocity(64 * Math.cos(time), 64     * Math.sin(time))
        let vel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y)
        this.rotation = vel.angle()
    }
}
