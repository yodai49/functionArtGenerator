var vertexHash={};
var edgeImgData;

function generateVertexMaster(){ // myCanvas[1]の画像をベクタ化してmyCanvas[2]にセット
    imgData=ctx[1].getImageData(0,0,myCanvas[1].width,myCanvas[1].height);    
    data=imgData.data;
//    ctx[2].drawImage(myCanvas[1],0,0,myCanvas[1].width,myCanvas[1].height);
    generateVertex();
    edgeImgData=ctx[1].getImageData(0,0,myCanvas[0].width,myCanvas[0].height).data;
    calcGradient();
    drawGradient();
    switchCanvas(2);
}

function drawGradient(){
    var theta;
    ctx[2].lineWidth=1;
    ctx[2].strokeStyle="rgba(0,255,0,1)";
    for(var i = 0; i<vertex.length;i++){
        if(vertex[i].power>1){
            theta=vertex[i].atan;
            ctx[2].moveTo(
                vertex[i].x - maxRad * Math.cos(theta),
                vertex[i].y + maxRad * Math.sin(theta)
            );
            ctx[2].lineTo(
                vertex[i].x + maxRad * Math.cos(theta),
                vertex[i].y - maxRad * Math.sin(theta),
            );
        }
    }
    ctx[2].stroke();
}

function calcGradient(){ //それぞれの頂点の傾きを計算する
    var arc=[];
    var xPos,yPos,dataPos;
    var aveX1,aveY1,aveX2,aveY2;
    var maxTheta,maxThetaVal=-1;
    var tanVote=0, avePerTheta=0;
    for(var i = 0;i < arcNum;i++){ //角度をあらかじめ計算しておく
        arc[i]={sin:Math.sin(i/arcNum*Math.PI*2),
                cos:Math.cos(i/arcNum*Math.PI*2)}
    }
    for(var i = 0;i < vertex.length;i++){
        maxThetaVal=-1;
        maxTheta=-1;
        avePerTheta=0;
        for(var j = 0;j < arcNum/2;j++){
            tanVote=0;
            for(var k = -radDiv;k <= radDiv;k++){
                xPos=vertex[i].x+maxRad*arc[j].cos*k/radDiv;
                yPos=vertex[i].y-maxRad*arc[j].sin*k/radDiv;
                if(0<=xPos && xPos < myCanvas[2].width) {
                    if(0 <= yPos && yPos < myCanvas[2].height){
                        dataPos=4*Math.round((xPos+Math.round(yPos)*myCanvas[2].width));
                        tanVote+=edgeImgData[dataPos];        
                    }
                }
            }
            if(tanVote>maxThetaVal){
                maxThetaVal=tanVote;
                maxTheta=(j/arcNum)*Math.PI*2;
            }
            avePerTheta+=tanVote;
        }
        avePerTheta/=(arcNum/2);
        vertex[i].tan=Math.tan(maxTheta);
        vertex[i].atan=maxTheta;
        vertex[i].power=(maxThetaVal-avePerTheta)/(255*radDiv);
    }
}

function getScore(x1,y1,x2,y2){ // 2点間の連結度合いを計算する
    var score=0;
    for(var i = 0; i <= scoreDiv;i++){
        checkX=(x1*i+x2*(scoreDiv-i))/scoreDiv;
        checkY=(y1*i+y2*(scoreDiv-i))/scoreDiv;
        if(edgeImgData[(checkY*myCanvas[2].width+checkX)*4]>=edgeCol[0]*addScoreThreshold){
            score++;
        }
    }
    return score;
}

function generateVertex(){ // ベクタ化する
    var lastY=-1; //最後に追加した頂点のY座標
    for(var i=0;i<myCanvas[2].height;i+=skipV){
        for(var j = 0;j < myCanvas[2].width;j+=skipH){
            cIndex=(i*myCanvas[2].width+j)*4;
            if(data[cIndex]>=edgeCol[0]*0.3){
                vertex.push({x:j,y:i}); //頂点リストにプッシュ
                if(lastY!=i) vertexHash[i]=vertex.length-1;
                lastY=i;
            }
        }
    }/*
    ctx[2].fillStyle="rgba(255,0,0,0.8)";
    for(var i = 0;i < vertex.length;i++){       
        ctx[2].moveTo(vertex[i].x,vertex[i].y); 
        ctx[2].arc(vertex[i].x,vertex[i].y,2,0,Math.PI*2);
    }
    ctx[2].fill();*/
}