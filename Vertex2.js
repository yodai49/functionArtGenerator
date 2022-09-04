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
        theta=Math.atan(vertex[i].tan);
        vertex[i].atan=theta; // Function3での再計算を避けるため、保存
        ctx[2].moveTo(
            vertex[i].x - 15 * Math.cos(theta),
            vertex[i].y - 15 * Math.sin(theta)
        );
        ctx[2].lineTo(
            vertex[i].x + 15 * Math.cos(theta),
            vertex[i].y + 15 * Math.sin(theta),
        );
    }
    ctx[2].stroke();
}

function calcGradient(){ //それぞれの頂点の傾きを計算する
    var arc=[];
    var xPos,yPos,dataPos;
    var aveX,aveY;
    for(var i = 0;i < arcNum;i++){ //角度をあらかじめ計算しておく
        arc[i]={sin:Math.sin(i/arcNum*Math.PI*2),
                cos:Math.cos(i/arcNum*Math.PI*2)}
    }
    for(var i = 0;i < vertex.length;i++){
        aveX=0;
        aveY=0;
        for(var j = 0;j < arcNum;j++){
            for(var k = 1;k <= radDiv;k++){
                xPos=Math.round(vertex[i].x+k/radDiv*maxRad*arc[j].cos);
                yPos=Math.round(vertex[i].y+k/radDiv*maxRad*arc[j].sin);
                if(0<=xPos && xPos < myCanvas[2].width){
                    if(0<=yPos && yPos<myCanvas[2].height){
                        dataPos=4*(xPos+yPos*myCanvas[2].width);
                        if(yPos<0) { // 0 < theta < pi にする
                            xPos*=-1;
                            yPos*=-1;
                        }
                        aveX+=(xPos-vertex[i].x)/k*edgeImgData[dataPos]; //平均方向を算出
                        aveY+=(yPos-vertex[i].y)/k*edgeImgData[dataPos];
                    }
                }
            }
        }
        vertex[i].tan=-aveX/aveY;
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
/*
function makeConnection(myList,vNum){ // listの中のscoreが高い順に、vNum番目の頂点から連結する
    // listは、連結数が2以下でvNumのそばにある頂点の集合
    var firstV={num:-1,score:-1},
        secondV={num:-1,score:-1};
    for(var i = 0;i < myList.length;i++){
        if(myList[i].score > firstV.score){
            secondV.score=firstV.score;
            secondV.num=firstV.num;
            firstV.score=myList[i].score;
            firstV.num=myList[i].num;
        } else if(myList[i].score>secondV.score){
            secondV.score=myList[i].score;
            secondV.num=myList[i].num;
        }
    }
    if(firstV.score > connectionScoreThreshold*(scoreDiv+1)){ // 頂点の連結情報を追加
        vertex[vNum].connection.push(firstV.num);
        vertex[firstV.num].connection.push(vNum);
    }
    if(secondV.score > connectionScoreThreshold*(scoreDiv+1)){
        vertex[vNum].connection.push(secondV.num);
        vertex[secondV.num].connection.push(vNum);
    }
}*/

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
    ctx[2].fillStyle="rgba(255,0,0,0.8)";
    for(var i = 0;i < vertex.length;i++){       
        ctx[2].moveTo(vertex[i].x,vertex[i].y); 
        ctx[2].arc(vertex[i].x,vertex[i].y,2,0,Math.PI*2);
    }
    ctx[2].fill();
}
/*
function detectLink(){ // 頂点の中からリンクを見つける　
    //1つの頂点は最大2こと連結
    var cPos=0;
    var d2=0;
    var neighborList=[];
    for(var i = 0;i < vertex.length;i++){
        if(vertexHash[vertex[i].y-linkEuclidThreshold]){
            cPos=vertexHash[vertex[i].y-linkEuclidThreshold];
        } else {
            cPos=0;
        }
        neighborList=[];
        if(vertex[i].connection.length<2){ // 1つの頂点は最大2個と連結する
            while(1){ // 距離の２乗がlinkEuclidThreshold以下の点を探索
                d2= (vertex[cPos].x-vertex[i].x)*(vertex[cPos].x-vertex[i].x)+
                    (vertex[cPos].y-vertex[i].y)*(vertex[cPos].y-vertex[i].y)
                if(d2 < linkEuclidThreshold && vertex[cPos].connection.length<2){ // 探索候補
                    myScore=getScore(vertex[i].x,vertex[i].y,vertex[cPos].x,vertex[cPos].y);
                    neighborList.push({
                        num:cPos,
                        x:vertex[cPos].x,
                        y:vertex[cPos].y,
                        score:myScore
                    });
                    cPos++;
                } else if(vertex[cPos].y-vertex[i].y>linkEuclidThreshold) { //探索候補外
                    break; // 円の領域よりも下を探索していたら終了
                } else if(vertex[cPos].x-vertex[i].x>0){
                    if(vertexHash[vertex[cPos].y+skipV]){
                        cPos=vertexHash[vertex[cPos].y+skipV]; //右側を探索していたら、次の段へ
                    } else {
                        break;
                    }
                } else {
                    cPos++; //それ以外は次を探索
                }
                if(cPos>=vertex.length) break;
            }
            makeConnection(neighborList,i);
        }
    }
}

function drawLink(){ // 連結を可視化する
    ctx[2].lineWidth=2;
    ctx[2].strokeStyle="rgba(0,255,0,1)";
    ctx[2].beginPath();
    for(var i = 0;i < vertex.length;i++){
        for(var j = 0;j < vertex[i].connection.length;j++){
            if(vertex[i].connection[j] > i){
                ctx[2].moveTo(
                    vertex[i].x,
                    vertex[i].y
                );
                ctx[2].lineTo(
                    vertex[vertex[i].connection[j]].x,
                    vertex[vertex[i].connection[j]].y
                );
            }
        }
    }
    ctx[2].stroke();
}*/
