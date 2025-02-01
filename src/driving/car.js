class Car extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture="car") {
        super(scene.matter.world, 0, 0, texture)
        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)
        this.setPosition(x, y-16)
        this.setFriction(8)             // Increase ground friction
        this.setFrictionStatic(0.8)     // Make it harder to start moving
        // this.setFrictionAir(1)          // Increase air resistance
        this.setBounce(0.1)

        this.name = "car"

        console.log(this.scene)

        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })

        this.steering = 0   // 1 = right, -1 = left, 0 = straigt
        this.steeringRate = 10
        this.wheelSpeed = 0
        this.wheelAcc = 15
        this.topSpeed = 35

        this.turnRadius = 10
        this.groundAccStatic = 80
        this.groundAccKinetic = 60

    }

    getAngularDiff(angle1, angle2) {
        return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
    }

    physicsUpdate(time, dt) {
        let pos = this.box2dBody.getPosition()
        let vel = this.box2dBody.getLinearVelocity()

        // process key inputs
        let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y)
        let fowardForce = this.wheelAcc * (World.upKey.isDown - 1.25 * World.downKey.isDown)

        // Car steering
        let steeringForce = World.rightKey.isDown - World.leftKey.isDown
        if (!steeringForce) {  // bring steering back to center when released
            let restoringForce = -Math.sign(this.steering) * Math.min(1, Math.abs(this.steering) / this.steeringRate / dt)
            this.steering += restoringForce * this.steeringRate * dt
        } else {
            this.steering += steeringForce * this.steeringRate * dt
            this.steering = Math.max(Math.min(this.steering, 1), -1)
        }
        let angularSpeed = this.steering * speed / this.turnRadius
        this.rotation += angularSpeed * dt

        // car rotation
        // rotation to straighten

        // let targetRotation = Math.atan2(vel.y, vel.x)
        // let currentRotation = this.rotation

        // let fowardsDiff = this.getAngularDiff(targetRotation, currentRotation)
        // let backwardsDiff = this.getAngularDiff(targetRotation, currentRotation + Math.PI)

        // let turnStep = Math.abs(fowardsDiff) <= Math.abs(backwardsDiff) ? fowardsDiff : backwardsDiff
        // if (turnStep < -Math.PI) turnStep += 2 * Math.PI
        // if (turnStep > Math.PI) turnStep -= 2 * Math.PI
        // let maxTurnStep = 0.5 * speed / this.turnRadius * dt
        // turnStep = Math.max(Math.min(turnStep, maxTurnStep), -maxTurnStep)
        // this.rotation += turnStep

        // rotation due to steering



        // direction of car
        let dir = [Math.cos(this.rotation), Math.sin(this.rotation)]

        // slideDir dot dir = fowardForce / groundAcc
        // (wheelVel - vel) dot dir = |wheelVel - vel| * fowardForce / groundAcc
        // (dir[0] - vel[0])*dir[0] + (dir[1] - vel[1])*dir[1] = sqrt()

        this.wheelSpeed += (fowardForce - this.wheelSpeed * this.wheelAcc / this.topSpeed) * dt

        let wheelVel = planck.Vec2(dir[0], dir[1]).mul(this.wheelSpeed)

        let slideVel = wheelVel.clone().sub(vel)
        let slideDir = slideVel.clone()
        slideDir.normalize()
        let slideForce = Math.min(this.groundAccStatic, slideVel.length() / dt)
        // slideForce = slideVel.length() / dt

        // console.log(slideForce)


        // direction of velocity
        let velDir = vel.clone()
        velDir.normalize()

        console.log(speed)


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
