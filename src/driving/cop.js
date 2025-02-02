class Cop extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture="cop") {
        super(scene.matter.world, 0, 0, texture)
        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)


        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })

        this.wheelSpeed = 0
        this.wheelAcc = 5
        this.topSpeed = 15          // top speed when close
        this.maxTopSpeed = 40       // top speed when at follow dist
        this.followDist = 8

        this.turnRadius = 10
        this.groundAccStatic = 80
        this.groundAccKinetic = 55
    }

    physicsUpdate(time, dt) {
        // car state
        let pos = this.box2dBody.getPosition()
        let vel = this.box2dBody.getLinearVelocity()
        let angleDiff = getAngularDiff(this.rotation, Math.atan2(vel.y, vel.x))
        let slidePercent = Math.max(Math.min(Math.abs(angleDiff) / 0.5, 1), 0)

        // target
        let carPos = this.scene.car.box2dBody.getPosition()
        let distToCar = carPos.clone().sub(pos)
        let targetDist = Math.sqrt(distToCar.x*distToCar.x + distToCar.y*distToCar.y)


        // process key inputs
        let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y)
        let fowardForce = this.wheelAcc * Math.min(Math.max(targetDist / this.followDist - 1, 1), this.maxTopSpeed / this.topSpeed)

        // wheel speed
        this.wheelSpeed += (fowardForce * (1 - 0.15 * slidePercent) - 
                            this.wheelSpeed * this.wheelAcc / this.topSpeed) * dt


        // Car steering
        let maxRotDelta = speed / this.turnRadius * dt
        let rotDelta = getAngularDiff(Math.atan2(distToCar.y, distToCar.x), this.rotation)
        rotDelta = Math.max(Math.min(rotDelta, maxRotDelta), -maxRotDelta)

        this.rotation += rotDelta    // fix to limit maximum turn rate to speed / turn radius

        let groundAcc = this.groundAccStatic * (1 - slidePercent) + this.groundAccKinetic * slidePercent


        // direction of car
        let dir = [Math.cos(this.rotation), Math.sin(this.rotation)]
        let wheelVel = planck.Vec2(dir[0], dir[1]).mul(this.wheelSpeed)

        let slideVel = wheelVel.clone().sub(vel)
        let slideDir = slideVel.clone()
        slideDir.normalize()
        let slideForce = Math.min(groundAcc, slideVel.length() / dt)

        // direction of velocity
        let velDir = vel.clone()
        velDir.normalize()

        let forces = [
            slideDir.mul(slideForce),
        ]

        for (let force of forces) this.box2dBody.applyForce(force, pos)
    }

    update(time, dt) {
        let aproxPos = this.box2dBody.getPosition().clone()
        let deltaPos = this.box2dBody.getLinearVelocity().clone()
        let physicsLag = this.scene.worldTimeSinceUpdate

        deltaPos.mul(physicsLag)
        aproxPos.add(deltaPos)

        this.setPosition(aproxPos.x * 16, aproxPos.y * 16)
    }
}
