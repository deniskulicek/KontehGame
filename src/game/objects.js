game.module(
    'game.objects'
)
.require(
    'engine.sprite'
)
.body(function() {

Player = game.Class.extend({
    jumpPower: -750,

    init: function() {
        var x = game.system.width / 2;
        var y = 500;
        this.sprite = new game.MovieClip([
            game.Texture.fromImage('media/player1.png'),
            game.Texture.fromImage('media/player2.png')
        ]);
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
        this.sprite.animationSpeed = 0.1;
        this.sprite.play();
        game.scene.stage.addChild(this.sprite);
        game.scene.addObject(this);

        this.body = new game.Body({
            position: {x: x, y: y},
            velocityLimit: {x: 100, y: 1000},
            collideAgainst: 0,
            collisionGroup: 1,
        });
        this.body.collide = this.collide.bind(this);
        var shape = new game.Rectangle(128+4, 48-4-8);
        this.body.addShape(shape);
        game.scene.world.addBody(this.body);

    },

    collide: function() {
        if(!game.scene.ended) {
            game.scene.gameOver();
            this.body.velocity.y = -200;
        }
        this.body.velocity.x = 0;
        return true;
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;
    },

    jump: function() {
        if(this.body.position.y < 0) return;
        this.body.velocity.y = this.jumpPower;
        game.analytics.event('jump');
    }
});

Gap = game.Class.extend({
    groundTop: 800,
    width: 132,
    minY: 150,
    maxY: 550,
    height: 232,
    speed: -300,

    init: function() {
        var y = Math.round(game.Math.random(this.minY, this.maxY));

        var topHeight = y - this.height / 2;
        this.topBody = new game.Body({
            position: {x: game.system.width + this.width / 2, y: topHeight / 2},
            velocity: {x: this.speed},
            collisionGroup: 0
        });
        var topShape = new game.Rectangle(this.width, topHeight);
        this.topBody.addShape(topShape);
        game.scene.world.addBody(this.topBody);

        var bottomHeight = this.groundTop - topHeight - this.height;
        this.bottomBody = new game.Body({
            position: {x: game.system.width + this.width / 2, y: topHeight + this.height + bottomHeight / 2},
            velocity: {x: this.speed},
            collisionGroup: 0
        });
        var bottomShape = new game.Rectangle(this.width, bottomHeight);
        this.bottomBody.addShape(bottomShape);
        game.scene.world.addBody(this.bottomBody);

        this.goalBody = new game.Body({
            position: {x: game.system.width + this.width / 2 + this.width + game.scene.player.body.shape.width, y: topHeight + this.height / 2},
            velocity: {x: this.speed},
            collisionGroup: 1,
            collideAgainst: 1
        });
        this.goalBody.collide = function() {
            game.scene.world.removeBody(this);
            game.scene.addScore();
            return false;
        };
        var goalShape = new game.Rectangle(this.width, this.height + game.scene.player.body.shape.height);
        this.goalBody.addShape(goalShape);
        game.scene.world.addBody(this.goalBody);

        this.topSprite = new game.Sprite(game.system.width + this.width / 2, topHeight, 'media/bar.png', {
            anchor: {x: 0.5, y: 0.0},
            scale: {y: -1}
        });
        game.scene.gapContainer.addChild(this.topSprite);

        this.bottomSprite = new game.Sprite(game.system.width + this.width / 2, topHeight + this.height, 'media/bar.png', {
            anchor: {x: 0.5, y: 0.0},
        });
        game.scene.gapContainer.addChild(this.bottomSprite);
    },

    update: function() {
        this.topSprite.position.x = this.bottomSprite.position.x = this.topBody.position.x;
        if(this.topSprite.position.x + this.width / 2 < 0) {
            game.scene.world.removeBody(this.topBody);
            game.scene.world.removeBody(this.bottomBody);
            game.scene.world.removeBody(this.goalBody);
            game.scene.gapContainer.removeChild(this.topSprite);
            game.scene.gapContainer.removeChild(this.bottomSprite);
            game.scene.removeObject(this);
        }
    }
});

Cloud = game.Sprite.extend({
    update: function() {
        this.position.x += this.speed * game.scene.cloudSpeedFactor * game.system.delta;
        if(this.position.x + this.width < 0) this.position.x = game.system.width;
    }
});

Logo = game.Class.extend({
    init: function() {
        var tween, sprite;

        this.container = new game.Container();
        this.container.position.y = -150;
        
        tween = new game.Tween(this.container.position)
            .to({y: 200}, 1500)
            .delay(100)
            .easing(game.Tween.Easing.Back.Out)
            .start();

        sprite = new game.Sprite(game.system.width / 2, 0, 'media/logo1.png', {anchor: {x:0.5, y:0.5}});
        this.container.addChild(sprite);
        tween = new game.Tween(sprite.position)
            .to({y: -20}, 1000)
            .easing(game.Tween.Easing.Quadratic.InOut)
            .repeat()
            .yoyo()
            .start();

        sprite = new game.Sprite(game.system.width / 2, 80, 'media/logo2.png', {anchor: {x:0.5, y:0.5}});
        this.container.addChild(sprite);
        tween = new game.Tween(sprite.position)
            .to({y: 100}, 1000)
            .easing(game.Tween.Easing.Quadratic.InOut)
            .repeat()
            .yoyo()
            .start();

        game.scene.stage.addChild(this.container);
    },

    remove: function() {
        var tween = new game.Tween(this.container)
            .to({alpha: 0}, 1000)
            .onComplete(this.container.remove.bind(this));
        tween.start();
    }
});

});
