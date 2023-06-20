import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  preload() {
    //Loading the background
    this.load.image("background", "assets/background/bg_layer1.png");
    //loading the platform image
    this.load.image("platform", "assets/platform/ground_grass.png");
    //loading player asset
    this.load.image("bunny-stand", "assets/player/bunny1_stand.png");
  }

  create() {
    //Creating the background:
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    //Creating platforms (static, group):
    this.platforms = this.physics.add.staticGroup();

    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }
    // Create bunny sprite:
    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);

    this.physics.add.collider(this.platforms, this.player);
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);
  }
  update() {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
      }
    });
    //find out from Arcade Physics if the player's physics body
    //is touching something below it
    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      //this makes the player jump straight up
      this.player.setVelocityY(-300);
    }
  }
}
