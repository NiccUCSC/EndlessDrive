class WorldCamera {

    static scene = null;

    static init(scene) {
        this.scene = scene;
        this.cam = scene.cameras.main

        this.vertTiles = 64
        this.zoom = tiles => 2 * scene.cameras.main.height / 16 / tiles
    }

    static startFollow(target) {
        this.cam.startFollow(target)
    }

    static update(time, dt) {
        this.cam.setZoom(this.zoom(this.vertTiles))
    }
}