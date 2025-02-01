class Box2DScene extends Phaser.Scene {
    constructor() {
        super({ key: "Box2DScene" });
    }

    preload() {
        this.load.image("box", "https://labs.phaser.io/assets/sprites/block.png");
    }

    create() {
        // Initialize Planck.js World
        this.world = planck.World(planck.Vec2(0, 10)); // Gravity

        // Create Ground (Static)
        this.ground = this.world.createBody({
            position: planck.Vec2(400 / 30, 580 / 30),
        });
        this.ground.createFixture(planck.Box(400 / 30, 10 / 30));

        // Create a Box (Dynamic)
        this.boxBody = this.world.createBody({
            type: "dynamic",
            position: planck.Vec2(400 / 30, 100 / 30),
        });
        this.boxBody.createFixture(planck.Box(20 / 30, 20 / 30), { density: 1.0, friction: 0.3 });

        // Add Phaser Sprite
        this.boxSprite = this.add.image(400, 100, "box").setScale(0.5);
    }

    update() {
        this.world.step(1 / 60); // Run physics simulation

        // Update the box sprite position from physics body
        let pos = this.boxBody.getPosition();
        this.boxSprite.setPosition(pos.x * 30, pos.y * 30);
    }
}

// Phaser Game Config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Box2DScene
};

// Start the Game
const game = new Phaser.Game(config);