class Cop extends Vehicle {
    constructor(scene, x, y, texture="cop") {
        super(scene, 0, 0, texture)

        this.health = 40

        scene.add.existing(this)
        this.scene = scene
        this.setDepth(10)
        this.setOrigin(0.5, 0.5)

        this.box2dBody = this.scene.world.createBody({
            type: "dynamic",
            position: planck.Vec2(x, y),
        })
        this.box2dBody.parent = this
        this.box2dBody.createFixture({
            shape: planck.Box(0.95, 0.45),
            friction: 0,
            restitution: 0,
            filterCategoryBits: scene.VEHICAL_CATEGORY,
        })
        this.box2dBody.createFixture({
            shape: planck.Circle(1.1),
            friction: 0,
            restitution: 0,
            filterCategoryBits: scene.COP_CAR_CATEGORY,
            filterMaskBits: scene.COP_CAR_CATEGORY,
        })
        this.box2dBody.setMassData({
            mass: 1,
            center: planck.Vec2(0, 0),
            I: 1,
        })

        this.wheelSpeed = 0
        this.wheelAcc = 10
        this.topSpeed = 15          // top speed when close
        this.maxTopSpeed = 40       // top speed when at follow dist
        this.nearTopSpeed = 35      // go faster when close
        this.followDist = 8
        this.nearDist = 6

        this.turnRadius = 10
        this.groundAccStatic = 80
        this.groundAccKinetic = 55
    }

    physicsUpdate(time, dt) {
        if (this.checkDead()) return

        // car state
        let pos = this.box2dBody.getPosition()
        let vel = this.box2dBody.getLinearVelocity()
        let angleDiff = getAngularDiff(this.rotation, Math.atan2(vel.y, vel.x))
        let slidePercent = Math.max(Math.min(Math.abs(angleDiff) / 0.5, 1), 0)

        if (this.scene.car.alive) {
            // target
            let carPos = this.scene.car.box2dBody.getPosition()
            let distToCar = carPos.clone().sub(pos)
            let targetDist = Math.sqrt(distToCar.x*distToCar.x + distToCar.y*distToCar.y)
    
    
            // process key inputs
            let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y)
            let fowardForce = this.wheelAcc * Math.min(Math.max(targetDist / this.followDist - 1, 1), this.maxTopSpeed / this.topSpeed)
            fowardForce *= Math.min(Math.max(2 - targetDist / this.nearDist, 1), this.nearTopSpeed / this.topSpeed)
    
            // wheel speed
            this.wheelSpeed += (fowardForce * (1 - 0.15 * slidePercent) - 
                                this.wheelSpeed * this.wheelAcc / this.topSpeed) * dt
    
    
            // Car steering
            let turnRadius = this.turnRadius * Math.min(0.1, 1)
            let maxRotDelta = speed / turnRadius * dt
            let rotDelta = getAngularDiff(Math.atan2(distToCar.y, distToCar.x), this.rotation)
            rotDelta = Math.max(Math.min(rotDelta, maxRotDelta), -maxRotDelta)
    
            this.rotation += rotDelta    // fix to limit maximum turn rate to speed / turn radius
    
        } else {
            this.wheelSpeed = 0
        }

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

        this.box2dBody.setAngularVelocity(0)
        this.box2dBody.setAngle(this.rotation)
    }

    checkDead() {
        let targetDist = 0
        if (this.scene.car) {
            let pos = this.box2dBody.getPosition()
            let carPos = this.scene.car.box2dBody.getPosition()
            let distToCar = carPos.clone().sub(pos)
            targetDist = Math.sqrt(distToCar.x*distToCar.x + distToCar.y*distToCar.y)
        }

        if (this.health < 0 || targetDist > 96) {
            this.destroy()
            return true
        }
        return false
    }

    update(time, dt) {
        // visual smoothness here
        let aproxPos = this.box2dBody.getPosition().clone()
        let deltaPos = this.box2dBody.getLinearVelocity().clone()
        let physicsLag = this.scene.worldTimeSinceUpdate

        deltaPos.mul(physicsLag)
        aproxPos.add(deltaPos)

        this.setPosition(aproxPos.x * 16, aproxPos.y * 16)
    }

    destroy() {
        this.scene.world.destroyBody(this.box2dBody)
        this.box2dBody = null
        this.scene.cops.delete(this)
        super.destroy()
    }
}
