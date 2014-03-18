game.module(
    'game.main'
)
.require(
    'engine.core',
    'engine.particle',
    'game.assets',
    'game.objects',
    'game.scenes'
)
.body(function(){

game.System.idtkScale = 'ScaleAspectFill';

game.start(SceneGame, 640, 960);

});