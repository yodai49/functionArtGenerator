var myCanvas=[];
var ctx=[];
var vertex=[];

window.addEventListener('DOMContentLoaded', function(){
    minX=Number(document.getElementById("value0").value);
    maxX=Number(document.getElementById("value1").value);
    maxY=Number(document.getElementById("value2").value);
    minY=Number(document.getElementById("value3").value);
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
    if(axisNum==0){
        minX=Number(document.getElementById("value" + axisNum).textContent);
    } else if(axisNum==1){
        maxX=Number(document.getElementById("value" + axisNum).textContent);
    } else if(axisNum==2){
        maxY=Number(document.getElementById("value" + axisNum).textContent);
    } else if(axisNum==3){
        minY=Number(document.getElementById("value" + axisNum).textContent);
    }
}