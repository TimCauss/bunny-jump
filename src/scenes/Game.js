import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player

  preload() {
    //Loading the background
    this.load.image("background", "assets/background/bg_layer1.png");
    //loading the platform image
    this.load.image("platform", "assets/platform/ground_grass.png");
    //preloading player asset
    this.load.image("bunny-stand", "assets/player/bunny1_stand.png");
  }

  create() {
    this.add.image(240, 320, "background");

    //Creating platforms (static, group):
    const platforms = this.physics.add.staticGroup();

    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();

      // Create bunny sprite:
      const player = this.physics.add
        .sprite(240, 320, "bunny-stand")
        .setScale(0.5);

      this.physics.add.collider(platforms, player);
    }
  }
}
