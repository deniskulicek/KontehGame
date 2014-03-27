game.module(
    'game.scenes'
)
.require(
    'engine.scene',
    'engine.keyboard'
)
.body(function() {

var fingerprint = new Fingerprint({canvas: true}).get();


SceneGame = game.Scene.extend({
    backgroundColor: 0xb2dcef,
    gapTime: 1500,
    gravity: 2500,
    score: 0,
    cloudSpeedFactor: 1,

    init: function() {
        game.ended = false;
        this.world = new game.World(0, this.gravity);
        
        this.addParallax(350, 'media/parallax1.png', -5);
        this.addParallax(620, 'media/parallax2.png', -40);

        this.addParallax(715, 'media/bushes.png', -110);
        this.addParallax(600, 'media/parallax3.png', -170);

        this.addCloud(100, 100, 'media/cloud1.png', -20);
        this.addCloud(300, 50, 'media/cloud2.png', -32);

        this.logo = new Logo();

        this.addCloud(650, 100, 'media/cloud3.png', -24);
        this.addCloud(700, 200, 'media/cloud4.png', -15);

        
        this.gapContainer = new game.Container();
        this.stage.addChild(this.gapContainer);

        this.player = new Player();
        
        var groundBody = new game.Body({
            position: {x: game.system.width / 2, y: 900},
            collisionGroup: 0,
        });
        var groundShape = new game.Rectangle(game.system.width, 100);
        groundBody.addShape(groundShape);
        this.world.addBody(groundBody);

        this.scoreText = new game.BitmapText(this.score.toString(), {font: 'Pixel'});
        this.scoreText.position.x = game.system.width / 2 - this.scoreText.textWidth / 2;
        this.stage.addChild(this.scoreText);

        var hitEffect = new Hit();

    },

    spawnGap: function() {
        this.addObject(new Gap());
    },

    addScore: function() {
        this.score++;
        this.scoreText.setText(this.score.toString());
    },

    addCloud: function(x, y, path, speed) {
        var cloud = new Cloud(x, y, path, {speed: speed});
        this.addObject(cloud);
        this.stage.addChild(cloud);
    },

    addParallax: function(y, path, speed) {
        var parallax = new game.TilingSprite(0, y, path);
        parallax.speed.x = speed;
        this.addObject(parallax);
        this.stage.addChild(parallax);
    },

    keydown: function() {
        if(game.keyboard.keysDown.SPACE === true){

            if(!game.scene.ended) {
                if(this.ended) return;
                if(this.player.body.mass === 0) {
                    game.analytics.event('play');
                    this.player.body.mass = 1;
                    this.logo.remove();
                    this.addTimer(this.gapTime, this.spawnGap.bind(this), true);
                }
                this.player.jump();
            } else {
                if (game.ended === true) {
                    game.analytics.event('restart');
                    game.system.setScene(SceneGame);
                }
            }
        }
    },

    mousedown: function() {
        if(this.ended) return;
        if(this.player.body.mass === 0) {
            game.analytics.event('play');
            this.player.body.mass = 1;
            this.logo.remove();
            this.addTimer(this.gapTime, this.spawnGap.bind(this), true);
        }
        this.player.jump();
    },

    showScore: function() {
        var box = new game.Sprite(game.system.width / 2, game.system.height / 2, 'media/gameover.png', {anchor: {x:0.5, y:0.5}});
        var highScore = parseInt(game.storage.get('highScore'),10) || 0;
        var newHigh = false;
        game.analytics.event('score', this.score, fingerprint.toString(), this.score);

        if(this.score > highScore) {
            game.storage.set('highScore', this.score);
            highScore = this.score;
            newHigh = true;
        }

        var highScoreText = new game.BitmapText(highScore.toString(), {font: 'Pixel'});
        highScoreText.position.x = 27;
        highScoreText.position.y = 43;
        box.addChild(highScoreText);

        var scoreText = new game.BitmapText('0', {font: 'Pixel'});
        scoreText.position.x = highScoreText.position.x;
        scoreText.position.y = -21;
        box.addChild(scoreText);

        if(game.Debug.enabled){
            var id = new game.BitmapText('DeviceID: '+fingerprint.toString(), {font: '25 Pixel'});
            id.position.x = 60;
            id.position.y = 111;
            box.addChild(id);
        }

        game.scene.stage.addChild(box);

        this.restartButton = new game.Sprite(game.system.width / 2, game.system.height / 2 + 250, 'media/restart.png', {
            anchor: {x:0.5, y:0.5},
            scale: {x:0, y:0},
            interactive: true,
            
            mousedown: function() {
                game.analytics.event('restart');
                game.system.setScene(SceneGame);
            }

        });
        setTimeout(function(){ game.ended = true; }, 500);
        if(this.score > 0) {
            var time = Math.min(100, (1 / this.score) * 1000);
            var scoreCounter = 0;
            this.addTimer(time, function() {
                scoreCounter++;
                scoreText.setText(scoreCounter.toString());
                if(scoreCounter >= game.scene.score) {
                    this.repeat = false;
                    if(newHigh) {
                        var newBox = new game.Sprite(-208, 59, 'media/new.png');
                        box.addChild(newBox);
                    }
                    game.scene.showRestartButton();
                }
            }, true);
        } else {
            this.showRestartButton();
        }
    },

    showRestartButton: function() {
        var tween = new game.Tween(this.restartButton.scale)
            .to({x:1, y:1}, 200)
            .easing(game.Tween.Easing.Back.Out);
        tween.start();
        this.stage.addChild(this.restartButton);
    },

    gameOver: function() {
        var i;
        this.cloudSpeedFactor = 0.2;
        this.ended = true;
        this.timers.length = 0;
        for (i = 0; i < this.objects.length; i++) {
            if(this.objects[i].speed) this.objects[i].speed.x = 0;
        }
        for (i = 0; i < this.world.bodies.length; i++) {
            this.world.bodies[i].velocity.set(0,0);
        }

        this.addTimer(500, this.showScore.bind(this));

    }
});

});