class Item extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture="car") {
        super(scene, 0, 0, texture)

        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })
        this.box2dBody.parent = this

        this.setPosition(x*16, y*16)
    }

    onCollect(car) {
        console.warn(`UNCONFIGURE ITEM COLLECTED: ${this}`)
    }

    physicsUpdate(time, dt) {
        this.box2dBody.setAngularVelocity(0)
        this.box2dBody.setAngle(this.rotation)
    }

    update(time, dt) {
        let aproxPos = this.box2dBody.getPosition().clone()
        let deltaPos = this.box2dBody.getLinearVelocity().clone()
        let physicsLag = this.scene.worldTimeSinceUpdate

        deltaPos.mul(physicsLag)
        aproxPos.add(deltaPos)

        this.setPosition(aproxPos.x * 16, aproxPos.y * 16)
    }

    destroy() {
        this.scene.world.destroyBody(this.box2dBody)
        this.scene.items.delete(this)
        delete this.box2dBody
        super.destroy()
    }
}
