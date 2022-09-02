var myCanvas=[];
var ctx=[];
var vertex=[];

window.addEventListener('DOMContentLoaded', function(){
    for(var i = 0;i < 4;i++) {
        myCanvas[i]= this.document.getElementById("canvasStep" + (i+1));
        ctx[i]=myCanvas[i].getContext("2d");
    }
});
function switchCanvas(canvasNum){ // switch a visible canvas 
    for(var i = 0;i < 4;i++){
        if(i==canvasNum){
            myCanvas[i].style.display = "block";
        } else {
            myCanvas[i].style.display = "none";
        }
    }
}
function resetCanvas(){ // 処理用のcanvasをリセット
    for(var i = 0;i < 4;i++){
        ctx[i].clearRect(0,0,myCanvas[i].width,myCanvas[i].height);
    }
}
function setAxisValue(axisNum){
    // x軸とy軸の左端と上端の値をセットする 左右上下の順番
    axisVal[axisNum]=document.getElementById("value" + axisNum).textContent;
}