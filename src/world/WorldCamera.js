class WorldCamera {

    static scene = null;

    static init(scene) {
        this.scene = scene;
        this.cam = scene.cameras.main

        this.vertTiles = 96
        this.zoom = tiles => 2 * scene.cameras.main.height / 16 / tiles
    }

    static startFollow(target) {
        this.cam.startFollow(target, false, 0.5, 0.5)
    }

    static stopFollow() {
        this.cam.stopFollow()
    }

    static update(time, dt) {
        this.cam.setZoom(this.zoom(this.vertTiles))
    }
}