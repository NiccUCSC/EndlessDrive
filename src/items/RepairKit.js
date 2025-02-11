class RepairKit extends Item {
    constructor(scene, x, y, texture="repairkit") {
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
        car.health = Math.min(car.health + 50, 100)
        console.log("COLLECTED REPAIR KIT")
        this.alive = false
        World.playFixEngine()
    }
}