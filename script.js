// ページの読み込みを待つ


function keypress(mykey,mykeycode){ //キー入力イベント
    if(mykey=="z"){
    }
}

window.addEventListener('load', init); //ロードイベント登録
window.addEventListener('DOMContentLoaded', function(){ ///キー入力イベント登録
    window.addEventListener("keydown", function(e){
      keypress(e.key,e.keyCode);
    });
});

function init() {
    //ローディング処理////////////////////////////////////////

    // サイズを指定
    const width = 960;
    const height = 540;

    //2Dの処理
    ctx2d=document.getElementById("myCanvas2").getContext("2d");
    ctx2d.width = width;
    ctx2d.height = height;

    tick();

    function tick() {
        t++;//システム系の処理
        //2次元のリセット処理
        ctx2d.clearRect(0,0,width,height);

        requestAnimationFrame(tick);
    }
}