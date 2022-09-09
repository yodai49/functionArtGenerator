var eraseLineDiv=50,eraseArcDiv=360;
var detectedEraseHW=10;

function eraseDetectedElements(){
// 既に検出済みの情報を削除する関数 Objectsに入っている図形{Linesegments, arc}から消去する
// オブジェクト上のベクトル場を削除
    var x,y,theta;
    var p;
    for(var i = 0;i < Objects.lineSegments.length;i++){
        p=getLineSegEdge(Objects.lineSegments[i]);
        for(var j = 0;j < eraseLineDiv;j++){
            x=getXPos(p[0].x)+j/(eraseLineDiv-1)*(getXPos(p[1].x)-getXPos(p[0].x));
            y=getYPos(p[0].y)+j/(eraseLineDiv-1)*(getYPos(p[1].y)-getYPos(p[0].y));  
            eraseNeighborVec(x,y,detectedEraseHW);
        }
    }
    for(var i = 0;i < Objects.arcs.length;i++){
        for(var j = 0;j < eraseArcDiv*2;j++){
            theta=Math.PI*2*j/eraseArcDiv;
            if(Objects.arcs[i].theta1<theta && theta<Objects.arcs[i].theta2){
                x=getXPos(Objects.arcs[i].x+Objects.arcs[i].r*Math.cos(theta));
                y=getYPos(Objects.arcs[i].y-Objects.arcs[i].r*Math.sin(theta));
                eraseNeighborVec(x,y,detectedEraseHW);    
            }
        }
    }
}

function eraseDetectedArc(myArc){
    for(var i = 0;i < eraseArcDiv*2;i++){
        theta=Math.PI*2*i/eraseArcDiv;
        if(myArc.theta1<theta && theta<myArc.theta2){
            x=getXPos(myArc.x+myArc.r*Math.cos(theta));
            y=getYPos(myArc.y-myArc.r*Math.sin(theta));
            eraseNeighborVec(x,y,detectedEraseHW);    
        }
    }
}

function eraseNeighborVec(x,y,eraseHW){ // 近接する場所のvecを削除　x,yはピクセル単位
    var vecX,vecY;
    for(var i = -eraseHW;i<=eraseHW;i++){
        vecX=Math.floor(x/myCanvas[2].width*vecDiv)+i;
        for(var j = -eraseHW;j<=eraseHW;j++){
            vecY=Math.floor(y/myCanvas[2].height*vecDiv)+j;
            if(0<=vecX&& vecX<vecDiv){
                if (0<=vecY&& vecY<vecDiv){
                    vec[vecX][vecY].x*=Math.abs(i*j/(eraseHW*eraseHW*eraseHW));
                    vec[vecX][vecY].y*=Math.abs(i*j/(eraseHW*eraseHW*eraseHW));
                }
            }
        }
    }
}