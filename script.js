var myCanvas=[];
var ctx=[];
    
/*function keypress(mykey,mykeycode){ //キー入力イベント
    if(mykey=="z"){
    }
}
*/
window.addEventListener('DOMContentLoaded', function(){
    for(var i = 0;i < 4;i++) {
        myCanvas[i]= this.document.getElementById("canvasStep" + (i+1));
        ctx[i]=myCanvas[i].getContext("2d");
    }/*
    window.addEventListener("keydown", function(e){ // key input event
      keypress(e.key,e.keyCode);
    });*/
});
function switchCanvas(canvasNum){ // switch a visible canvas 
    for(var i = 0;i < 4;i++){
        if(i==canvasNum){
            myCanvas[i].style.display = "absolute";
        } else {
            myCanvas[i].style.display = "none";
        }
    }
}
function uploadFile(files){ //ここの解読から
    switchCanvas(0);
    var reader = new FileReader();              // エ　ローカルファイルの処理
    reader.onload = function(event) {           // オ　ローカルファイルを読込後処理
        var img = new Image();                 // カ　　画像ファイルの処理
        img.onload = function() {              // キ　　　画像ファイル読込後の処理
            ctx[0].drawImage(img, 0, 0);          // コ　　　　　画像をcanvasに表示
        }                                       // サ　
        img.src = event.target.result;         // シ　　　画像を読み込む　
    }                                           // ス　
    reader.readAsDataURL(files[0]);             // セ　ローカルファイルを読み込む　　
}

function generateMaster(){

}