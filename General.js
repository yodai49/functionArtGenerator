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

function normalizeData(keyName){ //データの標準化を行う関数
    var mean=0,s=0;
    var min=9999,max=-9999;
    for(var i = 0;i < vertex.length;i++){ // 平均を算出
        mean+=vertex[i][keyName];
    }
    mean/=vertex.length;
    for(var i = 0;i < vertex.length;i++){ // 標準偏差を算出
        s+=(vertex[i][keyName]-mean)*(vertex[i][keyName]-mean);
    }
    s/=vertex.length;
    s=Math.sqrt(s);
    for(var i = 0;i < vertex.length;i++){
        vertex[i][keyName]=(vertex[i][keyName]-mean)/s;
        if(max<vertex[i][keyName]) max=vertex[i][keyName];
        if(min>vertex[i][keyName]) min=vertex[i][keyName];
    }
    normalizeParam[keyName]={};
    normalizeParam[keyName].mean=mean; // 標準偏差と平均を記録しておく
    normalizeParam[keyName].s=s;
    normalizeParam[keyName].max=max;
    normalizeParam[keyName].min=min;
}

function getXPos(xVal){ // 座標平面上の値からキャンバス上の値に変換する
    return (xVal-minX)/(maxX-minX)*myCanvas[3].width;
}
function getYPos(yVal){ // 座標平面上の値からキャンバス上の値に変換する
    return (1-(yVal-minY)/(maxY-minY))*myCanvas[3].height;
}
function getXCrd(xVal){ // キャンバス上の値から座標平面上の値に変換する
    return xVal/myCanvas[3].width*(maxX-minX)+minX;
}
function getYCrd(yVal){ // キャンバス上の値から座標平面上の値に変換する
    return (1-yVal/myCanvas[3].height)*(maxY-minY)+minY;
}