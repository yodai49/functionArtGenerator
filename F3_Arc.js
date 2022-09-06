var arcVote=[];
var normLines=[];
var centerOfArcs=[]; // 円の中心候補のリスト 座標はピクセル単位で管理 (x:-- y:--)

function detectArc(){
    // 円を検出する
    for(var i = 0;i < vertex.length;i++){ // 投票データの抽出
        if(vertex[i].power>=1.2){
            normLines.push({alpha:vertex[i].atan,
                            beta:-Math.cos(vertex[i].atan)*getXCrd(vertex[i].x)
                                 -Math.sin(vertex[i].atan)*getYCrd(vertex[i].y)})
        }
    }

    for(var i = 0;i < voteDivArc;i++){
        arcVote[i]=[];
        for(var j = 0;j < voteDivArc;j++){
            arcVote[i][j]=0;
        }
    }
    var x,y,d;
    var flg=0; // 0のときは、次にdが0になったらその行の走査を終了してよい
    var maxD=0;
    for(var i = 0;i < normLines.length;i+=4){
        for(var j =0;j < voteDivArc;j++){
            y=j/voteDivArc*(maxY-minY)+minY;
            flg=1;
            for(var k = 0;k < voteDivArc;k++){
                x=k/voteDivArc*(maxX-minX)+minX;
                d=Math.abs(Math.cos(normLines[i].alpha)*x+Math.sin(normLines[i].alpha)*y+normLines[i].beta);
                d=Math.max(d,(maxX-minX)/1000); // 距離が近くなりすぎないようにする 
                d=Math.round(1/d);
                if(d!=0 && flg==1) {
                    flg=0;
                }
                if(d==0 && flg==0) break;
                arcVote[k][j]+=d; //投票
                if(arcVote[k][j]>maxD)maxD=arcVote[k][j];
            }
        }        
    }
    for(var i = 0;i < voteDivArc;i++){
        for(var j = 0;j < voteDivArc;j++){
            if(arcVote[i][j]/maxD>arcDetectThreshold) { // 統合の際に扱いやすいよう2値化
                arcVote[i][j]=1;
            } else {
                arcVote[i][j]=0;
            }
        }
    }
    unifyCenterOfArcs();
    listUpCenterOfArcs();
    searchRadOfArcs();
    for(var i = 0;i < voteDivArc;i++){
        for(var j = 0;j < voteDivArc;j++){
            if(arcVote[i][j]!=0) {
                arcVote[i][j]=1;
                ctx[2].fillStyle="rgba(255,255,0,1)";
                ctx[2].fillRect(i/voteDivArc*myCanvas[3].width,(voteDivArc-j)/voteDivArc*myCanvas[3].height,myCanvas[3].width/voteDivArc,myCanvas[3].height/voteDivArc);
            } else {
                arcVote[i][j]=0;
            }
        }
    }
}

function unifyCenterOfArcs(){ //近くにある中心同士を併合する
    var xSum,ySum,unifyNum=0;
    for(var i = 0;i < voteDivArc;i++){
        for(var j = 0;j < voteDivArc;j++){
            if(arcVote[i][j]!=0){ // 候補となっていたら 
                unifyNum=0;
                xSum=0;
                ySum=0;
                for(var k = -arcUnifyWH;k<=arcUnifyWH;k++){
                    for(var l = -arcUnifyWH;l<=arcUnifyWH;l++){
                        if(0<=i+k&&i+k<voteDivArc && 0 <= j+l && j+l < voteDivArc){
                            if(arcVote[i+k][j+l]!=0){
                                xSum+=(i+k)*arcVote[i+k][j+l];
                                ySum+=(j+l)*arcVote[i+k][j+l];;
                                unifyNum+=arcVote[i+k][j+l];
                            }
                            arcVote[i+k][j+l]=0;
                        }
                    }
                }
                xSum=Math.round(xSum/unifyNum);
                ySum=Math.round(ySum/unifyNum);
                arcVote[xSum][ySum]=unifyNum;
            }
        }
    }
}

function listUpCenterOfArcs(){
    for(var i = 0;i < voteDivArc;i++){
        for(var j = 0;j < voteDivArc;j++){
            if(arcVote[i][j]!=0){
                centerOfArcs.push({
                    x:i/voteDivArc*myCanvas[3].width,
                    y:(voteDivArc-j)/voteDivArc*myCanvas[3].height
                });
            }
        }
    }
}

function getScoreOfArc(myArc){ // {data:[0,0.5,...], score:--}   scoreはエッジが検出された部分の割合　離散化されていないので注意
    var x,y,dataPos;
    var arcOfAD=[];
    var vecX,vecY;
    var theta, innnerProduct, cosAlpha;
    var score=0;
    var data=[];
    theta=myArc.theta1;
    while(1){
        arcOfAD.push({
            cos:Math.cos(theta),
            sin:Math.sin(theta)
        })
        theta+=Math.PI*2/arcNumAD;
        if(theta>myArc.theta2) break;
    }
    myArc.x=getXPos(myArc.x);
    myArc.y=getYPos(myArc.y);
    myArc.r=Math.abs(getXPos(myArc.r)-getXPos(0));
    for(var i = 0;i < arcOfAD.length;i++){
        data[i]=0;
        x=Math.round(myArc.x+myArc.r*arcOfAD[i].cos);
        y=Math.round(myArc.y+myArc.r*arcOfAD[i].sin);
        if(0<=x && x < myCanvas[3].width){
            if(0<=y && y<myCanvas[3].height){
                vecX=Math.floor(x/myCanvas[3].width*vecDiv);
                vecY=Math.floor(y/myCanvas[3].height*vecDiv);
                dataPos=4*(x+y*myCanvas[1].width);
                innnerProduct=Math.abs(
                    -arcOfAD[i].sin*vec[vecX][vecY].x
                    +arcOfAD[i].cos*vec[vecX][vecY].y)
                cosAlpha=innnerProduct
                        /(Math.sqrt(vec[vecX][vecY].x*vec[vecX][vecY].x+vec[vecX][vecY].y*vec[vecX][vecY].y));
                data[i]=innnerProduct;
                if(edgeImgData[dataPos]>thresholdOfEdge){ // 白い領域
                    data[i]+=1;
                }    
                score+=data[i];
            }
        }
    }
    return {
        data:data,
        score:score/arcOfAD.length
    };
}

function searchRadOfArcs(){ // 円の半径を調べる
    var d=0,arcSearchData;
    var scoreListByRad=[];
    var pushListR=[];
    var pushListA=[];
    ctx[2].strokeStyle="rgba(255,255,0,1)";
    for(var i = 0;i < centerOfArcs.length;i++){
        scoreListByRad=[];
        // 図示している黄色い円に沿って調べる
        d=0;
        while(1){
            d+=radSpacingAD;
            if(
                centerOfArcs[i].x+d>=myCanvas[3].width && centerOfArcs[i].x-d<0 &&
                centerOfArcs[i].y+d>=myCanvas[3].height && centerOfArcs[i].y-d<0
            ) break;
            arcSearchData=getScoreOfArc({
                x: getXCrd(centerOfArcs[i].x), y: getYCrd(centerOfArcs[i].y),
                r: Math.abs(getXCrd(d)-getXCrd(0)), theta1:0, theta2:Math.PI*2
            })
            scoreListByRad.push({
                score:arcSearchData.score,
                r:d
            });
        }
        pushListR=getPushListRad(scoreListByRad); // 円弧がある部分の半径のリストを取得する
        for(var j=0;j < pushListR.length;j++){
            pushListA=getPushList( // pushListにプッシュする角度のリストを格納
                getScoreOfArc({
                    x: getXCrd(centerOfArcs[i].x), y: getYCrd(centerOfArcs[i].y),
                    r: Math.abs(getXCrd(pushListR[j])-getXCrd(0)), theta1:0, theta2:Math.PI*2
                }).data, Math.abs(getXCrd(pushListR[j])-getXCrd(0)));
            for(var k = 0;k < pushListA.length;k++){
                Objects.arcs.push({
                    x: getXCrd(centerOfArcs[i].x), y: getYCrd(centerOfArcs[i].y),
                    r: Math.abs(getXCrd(pushListR[j])-getXCrd(0)), theta1:pushListA[k].theta1, theta2:pushListA[k].theta2
                })
            }
        }
    }
}
function getPushListRad(data){ // 円を検出する半径のリストを返す 微分値が0になる点のリスト
    var flg=-1, tempList=[];
    for(var i = 1;i < data.length;i++){
        if(data[i].score-data[i-1].score> 0){ //増加時
            flg=1;
        } else { //減少時
            if(flg==1){ //　極大値なのでプッシュ
                if((data[i-1].r+data[i].r)/2>minArcRadThreshold) tempList.push((data[i-1].r+data[i].r)/2);
            }
            flg=-1;
        }
    }
    return tempList;
}

function getPushList(data,r){ // dataのうち円弧に相当する部分を角度に変換したデータを返す rは座標上の値
    var tempList=[];
    var tempL;
    var initialBlank=-1; //初めて空白が現れる場所
    var posOf01=-1,posOf10=-1;
    var rOfDrawing = Math.abs(getXPos(r)-getXPos(0));
    for(var i = 0;i < data.length;i++){ // データを01化
        data[i]=Math.floor(data[i]);
        data[i]=Math.min(1,data[i]);
    }
/*    for(var i = 1;i < data.length-1;i++){
        if(data[i-1]==1 && data[i]==0 && data[i+1]==1) data[i]=1; //101は111にする
    }*/
    for(var i = 0;i < data.length;i++){
        if(data[i]==0 && initialBlank==-1) initialBlank=i; //　最初の空白を探索
    }
    if(initialBlank==-1) return [{theta1:0,theta2:Math.PI*2}]; // 空白が一つもなかったら円全体を導入
    for(var i = initialBlank+1;i<=initialBlank+data.length;i++){
        if(data[(i-1+data.length)%data.length] == 0 && data[i%data.length] == 1) posOf01=i;
        if(data[(i-1+data.length)%data.length] == 1 && data[i%data.length] == 0) { // 10を検出
            posOf10=i;
            tempL=rOfDrawing*Math.PI*2*(posOf10-posOf01)/data.length; // 弧の長さ
            if(tempL>arcMinLengthRequired){ // 最低要求の長さを超えている
                if(tempL>arcMinLength || (posOf10-posOf01)/data.length > arcMinRatio){ //割合か長さ要件を満たす場合
                    tempList.push({
                        theta1:posOf01/data.length*Math.PI*2,
                        theta2:posOf10/data.length*Math.PI*2
                    })
                }
            }
        }
    }
    return tempList;
}

function adjustArc(){ // 円リストにある円を微修正する
    var adjustCenter=adjustArcParam.center*2,adjustRad=adjustArcParam.r*2;
    var adjustedX, adjustedY, adjustedR;
    var maxScore=-1,score,maxScoreParam={};
    for(var i = 0;i < adjustArcParam.rep;i++){
        adjustCenter/=2;
        adjustRad/=2;
        for(var j = 0;j < Objects.arcs.length;j++){
            for(var k = -adjustArcParam.centerDiv;k < adjustArcParam.centerDiv;k++){
                adjustedX=Objects.arcs[j].x+adjustCenter*k/adjustArcParam.centerDiv;
                for(var l =-adjustArcParam.centerDiv; l<adjustArcParam.centerDiv;l++){
                    adjustedY=Objects.arcs[j].y+adjustCenter*l/adjustArcParam.centerDiv;
                    for(var m = -adjustArcParam.radDiv; m < adjustArcParam.radDiv;m++){
                        adjustedR=Objects.arcs[j].r+adjustRad*m/adjustArcParam.radDiv;
                        score=getScoreOfArc({
                            x: adjustedX, y: adjustedY, r: adjustedR,
                            theta1:0, theta2:Math.PI*2
                        }).score;
                        if(score>maxScore){
                            maxScoreParam.x=adjustedX;
                            maxScoreParam.y=adjustedY;
                            maxScoreParam.r=adjustedR;
                            maxScore=score;
                        }
                    }
                }
            }
            Objects.arcs[j].x=maxScoreParam.x;
            Objects.arcs[j].y=maxScoreParam.y;
            Objects.arcs[j].r=maxScoreParam.r;
        }    
    }
}

function drawArcsToPicture(){
    ctx[1].lineWidth=1;
    ctx[1].strokeStyle="rgba(255,0,0,1)";
    ctx[1].beginPath();
    for(var i = 0;i < Objects.arcs.length;i++){
        ctx[1].moveTo(
            getXPos(Objects.arcs[i].x)+(Math.abs(getXPos(Objects.arcs[i].r)-getXPos(0)))*Math.cos(Objects.arcs[i].theta1),
            getYPos(Objects.arcs[i].y)+(Math.abs(getYPos(Objects.arcs[i].r)-getYPos(0)))*Math.sin(Objects.arcs[i].theta1));
        ctx[1].ellipse(
            getXPos(Objects.arcs[i].x),
            getYPos(Objects.arcs[i].y),
            Math.abs(getXPos(Objects.arcs[i].r)-getXPos(0)),
            Math.abs(getYPos(Objects.arcs[i].r)-getYPos(0)),
            0,
            Objects.arcs[i].theta1, Objects.arcs[i].theta2
        )
    }
    ctx[1].stroke();
}