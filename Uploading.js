function uploadFile(files){ // 画像のアップロードボタンの処理
    var reader = new FileReader();
    if(files.length!=1) return;
    resetCanvas();
    setGeneralStatus(1);
    reader.onload = function(event) {
    var img = new Image();
        img.onload = function() {
            if(img.width<img.height){ //縦長
                ctx[0].drawImage(img, 0, (img.height-img.width)/2,img.width,img.width,0,0,myCanvas[0].width,myCanvas[0].height);
            } else { //正方形または横長
                ctx[0].drawImage(img, (img.width-img.height)/2,0, img.height,img.height,0,0,myCanvas[0].width,myCanvas[0].height);
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(files[0]);
    document.getElementById("generateButton").disabled=false;
    switchCanvas(0);
}