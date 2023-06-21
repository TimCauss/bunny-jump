import Phaser from "../lib/phaser.js";

//import carot class:
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.carrotsCollected = 0;
  }
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  /** @type {Phaser.Physics.Arcade.Group} */
  carrots;

  /** @type {Phaser.GameObjects.Text} */
  carrotsCollectedText;

  preload() {
    //Loading the background
    this.load.image("background", "assets/background/bg_layer1.png");
    //loading the platform image
    this.load.image("platform", "assets/platform/ground_grass.png");
    //loading player asset
    this.load.image("bunny-stand", "assets/player/bunny1_stand.png");
    this.load.image("bunner-jump", "assets/player/bunny1_jump.png");
    //Loading carrot asset:
    this.load.image("carrot", "assets/items/carrot_gold.png");

    this.cursors = this.input.keyboard.createCursorKeys();
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
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    //Create Carrot
    this.carrots = this.physics.add.group({
      classType: Carrot,
    });

    //test Carrot:
    // this.carrots.get(240, 320, "carrot");

    // adding platforms vs Carrots collider
    this.physics.add.collider(this.platforms, this.carrots);

    //Carrots Collect Logic:
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot, //Called on overlap
      undefined,
      this
    );

    const style = { color: "#000", fontSize: 24 };
    this.carrotsCollectedText = this.add
      .text(240, 10, "Carrots: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update() {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();

        this.addCarrotAbove(platform);
      }
    });

    this.carrots.children.iterate((child) => {
      const carrot = child;

      const scrollY = this.cameras.main.scrollY;
      if (carrot.y >= scrollY + 700) {
        this.carrots.killAndHide(carrot);
        this.physics.world.disableBody(carrot.body);
      }
    });

    //find out from Arcade Physics if the player's physics body
    //is touching something below it
    const touchingDown = this.player.body.touching.down;

    //input logic
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else if (this.cursors.space.isDown && touchingDown) {
      //this makes the player jump straight up
      this.player.setVelocityY(-300);
    } else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);

    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over");
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /**@type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, "carrot");

    //set active and visible
    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    //update the physics body size:
    carrot.body.setSize(carrot.width, carrot.height);

    //make sure body is enabled in the physics world:
    this.physics.world.enable(carrot);

    return carrot;
  }

  /**
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Carrot} carrot
   */
  handleCollectCarrot(player, carrot) {
    //hide from display
    this.carrots.killAndHide(carrot);

    //disable from physics world
    this.physics.world.disableBody(carrot.body);

    this.carrotsCollected++;

    //Create new text value and set it:
    const value = `Carrots: ${this.carrotsCollected}`;
    this.carrotsCollectedText.text = value;
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];

    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i];

      //discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }
}
