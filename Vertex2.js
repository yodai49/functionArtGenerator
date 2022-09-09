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
        if(vertex[i].power>powerThreshold){
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

function drawVec(){ //ベクトル場を可視化する
    ctx[2].strokeStyle="rgba(255,0,0,1)";
    ctx[2].beginPath();
    for(var i = 0;i < vecDiv;i+=5){
        for(var j = 0;j < vecDiv;j+=5){
            if(vec[i][j].x*vec[i][j].x+vec[i][j].y*vec[i][j].y>0){
                ctx[2].moveTo(i/vecDiv*myCanvas[2].width, j/vecDiv*myCanvas[2].height);
                ctx[2].lineTo(i/vecDiv*myCanvas[2].width+vec[i][j].x*5, j/vecDiv*myCanvas[2].height-vec[i][j].y*5);
            }   
        }
    }
    ctx[2].stroke();
}

function calcGradient(){ //それぞれの頂点の傾きを計算し、ベクトル場を作る
    var arc=[];
    var xPos,yPos,dataPos;
    var vecX,vecY,vecD;
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
        if(vertex[i].power>=powerThreshold){ //ベクトル場の処理
            for(var j = -vecHW;j <= vecHW;j++){
                for(var k = -vecHW;k<=vecHW;k++){
                    vecX=Math.round(vertex[i].x/myCanvas[2].width*vecDiv+j);
                    vecY=Math.round(vertex[i].y/myCanvas[2].height*vecDiv+k);
                    vecD=Math.sqrt(j*j+k*k);
                    vecD=Math.max(1,vecD);
                    if(0<=vecX&&vecX<vecDiv && 0<=vecY && vecY<vecDiv){ // 領域内部にあったら
                        vec[vecX][vecY].x+=Math.cos(vertex[i].atan)/vecD;
                        vec[vecX][vecY].y+=Math.sin(vertex[i].atan)/vecD;
                    }
                }
            }
        }
    }
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
    }
}