class Car extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture="car") {
        super(scene.matter.world, 0, 0, texture)
        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)

        this.name = "car"

        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })

        this.steering = 0   // 1 = right, -1 = left, 0 = straigt
        this.steeringRate = 12
        this.wheelSpeed = 0
        this.wheelAcc = 20
        this.topSpeed = 32

        this.turnRadius = 10
        this.groundAccStatic = 80
        this.groundAccKinetic = 55

    }

    getAngularDiff(angle1, angle2) {
        return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
    }

    physicsUpdate(time, dt) {


        // car state
        let pos = this.box2dBody.getPosition()
        let vel = this.box2dBody.getLinearVelocity()
        let angleDiff = this.getAngularDiff(this.rotation, Math.atan2(vel.y, vel.x))
        let slidePercent = Math.max(Math.min(Math.abs(angleDiff) / 0.5, 1), 0)


        // process key inputs
        let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y)
        let fowardForce = this.wheelAcc * (World.upKey.isDown - 1.25 * World.downKey.isDown)

        // wheel speed
        this.wheelSpeed += (fowardForce * (1 + 0.15 * slidePercent) - 
                            this.wheelSpeed * this.wheelAcc / this.topSpeed) * dt


        // Car steering
        let steeringForce = World.rightKey.isDown - World.leftKey.isDown
        if (!steeringForce) {  // bring steering back to center when released
            let restoringForce = -Math.sign(this.steering) * Math.min(1, Math.abs(this.steering) / this.steeringRate / dt)
            this.steering += restoringForce * this.steeringRate * dt
        } else {
            this.steering += steeringForce * this.steeringRate * dt
            this.steering = Math.max(Math.min(this.steering, 1), -1)
        }
        let angularSpeed = this.steering * (speed + Math.abs(this.wheelSpeed)) / 2 / this.turnRadius
        this.rotation += angularSpeed * dt

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
