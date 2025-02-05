class Vehicle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture="car") {
        super(scene, 0, 0, texture)
        this.collidingWith = new Set()
        this.health = 100
    }

    impact(impactVelocity, other) {
        let damage = 2 * impactVelocity
        switch (other) {
        case "cop":
        case "car":
            this.health -= damage * 0.25
            break
        case "wall":
            this.health -= damage
            break
        }
    }
}