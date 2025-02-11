class Car extends Vehicle {
    constructor(scene, x, y, texture="car") {
        super(scene, 0, 0, texture, {onDeathCallback: World.PlayScene.onGameOver})
        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)

        this.name = "car"

        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })
        this.box2dBody.createFixture({  // main
            shape: planck.Box(0.9, 0.45),
            friction: 0,
            restitution: 0,
            filterCategoryBits: scene.VEHICAL_CATEGORY | scene.PLAYER_CATEGORY,
        })
        this.box2dBody.setMassData({
            mass: 2,
            center: planck.Vec2(0, 0),
            I: 1,
        })
        this.box2dBody.parent = this

        this.steering = 0           // 1 = right, -1 = left, 0 = straigt
        this.steeringRate = 12
        this.wheelSpeed = 0
        this.wheelAcc = 20
        this.topSpeed = 32

        this.turnRadius = 10.5
        this.groundAccStatic = 80
        this.groundAccKinetic = 55

        console.log(`Car at ${this.box2dBody.getPosition()}`)
        this.onDeathCallback = () => {
            this.scene.onGameOver()
        }

    }


    physicsUpdate(time, dt) {
        super.physicsUpdate(time, dt)

        // car state
        let pos = this.box2dBody.getPosition()
        let vel = this.box2dBody.getLinearVelocity()
        let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y)
        let angleDiff = getAngularDiff(this.rotation, Math.atan2(vel.y, vel.x))
        let slidePercent = Math.max(Math.min(Math.abs(angleDiff) / 0.5, 1), 0) * (speed > 1)
        let groundAcc = this.groundAccStatic * (1 - slidePercent) + this.groundAccKinetic * slidePercent
        groundAcc *= clampedMap(this.wheelHealth, 0, 0.5, 0.25, 1)

        // update car sliding and render tiremarks
        super.sliding(slidePercent, time, dt)

        // process key inputs
        let fowardForce = 0
        let steeringForce = 0
        if (this.alive) {
            fowardForce = this.wheelAcc * (1 + 0.5 * World.upKey.isDown - 0.5 * World.downKey.isDown)
            steeringForce = World.rightKey.isDown - World.leftKey.isDown
        }

        // wheel speed
        this.wheelSpeed += (fowardForce * (1 + 0.15 * slidePercent) - 
                            this.wheelSpeed * this.wheelAcc / this.topSpeed) * dt

        // Car steering
        if (!steeringForce) {  // bring steering back to center when released
            let restoringForce = -Math.sign(this.steering) * Math.min(1, Math.abs(this.steering) / this.steeringRate / dt)
            this.steering += restoringForce * this.steeringRate * dt
        } else {
            this.steering += steeringForce * this.steeringRate * dt
            this.steering = Math.max(Math.min(this.steering, 1), -1)
        }
        let angularSpeed = this.steering * (speed + Math.abs(this.wheelSpeed)) / 2 / this.turnRadius
        this.rotation += angularSpeed * dt

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
            slideDir.mul(slideForce * 2),
        ]

        for (let force of forces) this.box2dBody.applyForce(force, pos)

        this.box2dBody.setAngularVelocity(0)
        this.box2dBody.setAngle(this.rotation)

        let frame = Phaser.Math.Clamp(Math.floor((100 - this.health) * 3 / 100), 0, 3)
        this.setFrame(frame)

        this.prevPos = {...this.prevPos, ...this.box2dBody.getPosition().clone()}
    }

    afterPhysicsUpdate() {
        super.sendSkidMarks()
        this.prevPos.rotation = this.rotation
    }

    update(time, dt) {
        let aproxPos = this.box2dBody.getPosition().clone()
        let deltaPos = this.box2dBody.getLinearVelocity().clone()
        let physicsLag = this.scene.worldTimeSinceUpdate

        deltaPos.mul(physicsLag)
        aproxPos.add(deltaPos)

        this.setPosition(aproxPos.x * 16, aproxPos.y * 16)
        super.sendTempSkidMarks(aproxPos.x, aproxPos.y)
    }


    destroy() {
        this.scene.world.destroyBody(this.box2dBody)
        delete this.scene.car
        delete this.box2dBody
        super.destroy()
    }
}
