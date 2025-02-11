class WheelRepair extends Item {
    constructor(scene, x, y, texture="wheelrepair") {
        super(scene, x, y, texture)

        this.setDisplaySize(32, 32)
        this.setDepth(10)

        this.box2dBody.createFixture({
            shape: planck.Circle(1),
            friction: 0,
            restitution: 0,
            filterCategoryBits: scene.ITEM_CATEGORY,
            filterMaskBits: scene.PLAYER_CATEGORY,
            isSensor: true,
        })
    }

    onCollect(car) {
        car.wheelHealth = Math.min(car.wheelHealth + 100, 100)
        console.log("COLLECTED WHEEL REPAIR")
        this.alive = false
        World.playFixTires()
    }
}