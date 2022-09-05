var lineVote=[];
var normalizeParam=[];

function drawLineToPicture(canvasNum){ //linesにある直線をキャンバスへ描画する
    var drawPoints=[];
    var x_mY,x_MY,y_mX,y_MX; // x_mYは、yが最小の時のxの値
    for(var i =0;i < Objects.lines.length;i++){
        drawPoints=[];
        x_mY=(Math.cos(Objects.lines[i].alpha)*minY-Objects.lines[i].beta)/Math.sin(Objects.lines[i].alpha);
        x_MY=(Math.cos(Objects.lines[i].alpha)*maxY-Objects.lines[i].beta)/Math.sin(Objects.lines[i].alpha);
        y_mX=(Math.sin(Objects.lines[i].alpha)*minX+Objects.lines[i].beta)/Math.cos(Objects.lines[i].alpha);
        y_MX=(Math.sin(Objects.lines[i].alpha)*maxX+Objects.lines[i].beta)/Math.cos(Objects.lines[i].alpha);
        if(minX<x_mY && x_mY < maxX){
            drawPoints.push({x:x_mY,y:minY});
        }
        if(minX<x_MY && x_MY < maxX){
            drawPoints.push({x:x_MY,y:maxY});
        }
        if(minY<y_mX && y_mX < maxY){
            drawPoints.push({x:minX,y:y_mX});
        }
        if(minY<y_MX && y_MX < maxY){
            drawPoints.push({x:maxX,y:y_MX});
        }
        if(drawPoints.length>=2){
            ctx[canvasNum].strokeStyle="rgba(255,0,0,1)";
            ctx[canvasNum].lineWidth=1;
            ctx[canvasNum].beginPath();
            ctx[canvasNum].moveTo(
                (drawPoints[0].x-minX)/(maxX-minX)*myCanvas[2].width,
                (1-(drawPoints[0].y-minY)/(maxY-minY))*myCanvas[2].height
            );
            ctx[canvasNum].lineTo(
                (drawPoints[1].x-minX)/(maxX-minX)*myCanvas[2].width,
                (1-(drawPoints[1].y-minY)/(maxY-minY))*myCanvas[2].height
            );
            ctx[canvasNum].stroke();
        } else {
            console.log("Failed drawing line. "); // ERROR
            console.log(Objects.lines[i],drawPoints,x_mY,x_MY,y_mX,y_MX);
        }
    }
} 

function searchCluster(clusterList,div,threshold,x,y){ // x,yの位置を探索して、クラスターに属するリストを返却する
    if(lineVote[x][y]>=threshold){
        clusterList.push({x:x,y:y});
        lineVote[x][y]=0;
        clusterList.concat(searchCluster([],div,threshold,(x+1)%div,y)); //// 要修正？？
        clusterList.concat(searchCluster([],div,threshold,(x-1+div)%div,y));
        clusterList.concat(searchCluster([],div,threshold,x,(y+1)%div));
        clusterList.concat(searchCluster([],div,threshold,x,(y-1+div)%div));
        return clusterList;
    } else {
        lineVote[x][y]=0;
        return [];
    }
}

function clusteringLine(div,threshold){ // 連結成分ごとにクラスタリング　threshold以下は全て0、採用されたもののみ1にする
    var tempList=[];
    var aveX,aveY;
    var flg=0, emptyLine=0;
    for(var i = 0;i < div;i++){ // 1つもthresholdを超える点がない位置を探索　(連結性が維持されるように)
        flg=1;
        for(var j = 0;j < div;j++){
            if(lineVote[j][i]>threshold){
                flg=0;
                break;
            }
        }
        if(flg==1) {
            emptyLine=i;
            break;
        }
    }
    for(var i = 0;i < div;i++){
        for(var j = 0;j < div;j++){
            tempList=searchCluster([],div,threshold,i,j);
            if(tempList.length!=0){
                aveX=0,aveY=0;
                for(var k = 0;k < tempList.length;k++){
                    aveX+=tempList[k].x;
                    if(tempList[k].x<emptyLine) aveX+=voteDiv;
                    aveY+=tempList[k].y;
                }
                aveX/=tempList.length;
                aveY/=tempList.length;
                aveX=(aveX+voteDiv)%voteDiv;
                lineVote[Math.round(aveX)][Math.round(aveY)]=1;
            }
        }
    }
}

function getScoreOfLineSeg(x1,y1,x2,y2,d){ // 2点間の連結情報を返す dは間隔 x,yはピクセル
    // 戻り値は　.scoreに割合、.dataに情報(0or1)を配列で格納する
    var score=0, regInterval=0;
    var minColThreshold=125; // 白いと判定する閾値
    var grad=(y2-y1)/(x2-x1);
    var xPos,yPos,lMax;
    var dataPos;
    var myData=[];
    if(Math.abs(grad)>1){ // yを基準に考える
        regInterval=Math.abs(d*Math.sin(Math.atan(grad)));
        lMax=Math.floor(Math.abs((y2-y1)/regInterval));
    } else { // xを基準に考える
        regInterval=Math.abs(d*Math.cos(Math.atan(grad)));
        lMax=Math.floor(Math.abs((x2-x1)/regInterval));
    }
    for(var i = 0;i <= lMax;i++){
        xPos=Math.round(x1+i/lMax*(x2-x1));
        yPos=Math.round(y1+i/lMax*(y2-y1));
        if(0<=xPos && xPos < myCanvas[2].width){
            if(0 <= yPos && yPos<myCanvas[2].height){
                dataPos=4*(xPos+(yPos*myCanvas[2].width));
                if(edgeImgData[dataPos]>=minColThreshold){
                    score++;
                    myData[i]=1;
                } else {
                    myData[i]=0;
                }
            }
        }
    }
    return {score:score/lMax, data:myData};
}

function reshapeLineIntoLineSegment(myLine){ // 直線を線分に変換して返す
    var x_mY,x_MY,y_mX,y_MX;
    x_mY=(Math.cos(myLine.alpha)*minY-myLine.beta)/Math.sin(myLine.alpha);
    x_MY=(Math.cos(myLine.alpha)*maxY-myLine.beta)/Math.sin(myLine.alpha);
    y_mX=(Math.sin(myLine.alpha)*minX+myLine.beta)/Math.cos(myLine.alpha);
    y_MX=(Math.sin(myLine.alpha)*maxX+myLine.beta)/Math.cos(myLine.alpha);
    myLine.pos={};
    if(Math.abs(x_mY-x_MY)>Math.abs(y_mX-y_MX)){ // xの方が差が大きい
        myLine.pos.mx=Math.max(minX,Math.min(maxX,x_mY));
        myLine.pos.Mx=Math.max(minX,Math.min(maxX,x_MY));
    } else { // yの方が差が大きい
        myLine.pos.my=Math.max(minY,Math.min(maxY,y_mX));
        myLine.pos.My=Math.max(minY,Math.min(maxY,y_MX));
    }
    return myLine;
}
function getLineSegEdge(myLineSeg){ // 線分の2つの端点の情報を配列にして返す [{x:--, y:--},{x:--, y:--},]
    var tempP=[];
    if("mx" in myLineSeg.pos){
        tempP.push({
            x:myLineSeg.pos.mx,
            y:(Math.sin(myLineSeg.alpha)*myLineSeg.pos.mx+myLineSeg.beta)/Math.cos(myLineSeg.alpha)
        })
    }
    if("Mx" in myLineSeg.pos){
        tempP.push({
            x:myLineSeg.pos.Mx,
            y:(Math.sin(myLineSeg.alpha)*myLineSeg.pos.Mx+myLineSeg.beta)/Math.cos(myLineSeg.alpha)
        })
    }
    if("my" in myLineSeg.pos){
        tempP.push({
            x:(Math.cos(myLineSeg.alpha)*myLineSeg.pos.my-myLineSeg.beta)/Math.sin(myLineSeg.alpha),
            y:myLineSeg.pos.my
        })
    } 
    if("My" in myLineSeg.pos){
        tempP.push({
            x:(Math.cos(myLineSeg.alpha)*myLineSeg.pos.My-myLineSeg.beta)/Math.sin(myLineSeg.alpha),
            y:myLineSeg.pos.My
        })
    } 
    return tempP;
}

function verifyLineSegments(myLineSeg){ // 線分の正確さを検証する　
    // 領域の白が一定割合(lineSegRatioThreshold)以上 かつ 白い部分が最大閾値(lineSegDivThreshold)以下 ならば一つの直線とみなす
    // 検証後の線分のリストを返す
    var p=getLineSegEdge(myLineSeg);
    if((getXPos(p[0].x)-getXPos(p[1].x))*(getXPos(p[0].x)-getXPos(p[1].x))+
       (getYPos(p[0].y)-getYPos(p[1].y))*(getYPos(p[0].y)-getYPos(p[1].y))<lineSegLengthMin*lineSegLengthMin) {
        return [];
    }
    lineSegData=getScoreOfLineSeg( 
        getXPos(p[0].x), getYPos(p[0].y),
        getXPos(p[1].x), getYPos(p[1].y),
        lineSegDetectDiv
    );

    var tempLineSegList=[];
    // 連続する1をそのまま線分として検出する
    for(var i = 1;i < lineSegData.data.length-1;i++){ // 101を111にする
        if( lineSegData.data[i-1]==1 && 
            lineSegData.data[i]==0 && 
            lineSegData.data[i+1]==1) lineSegData.data[i]=1;
    }
    var startEdge=-1;
    lineSegData.data.push(0); //末尾に0を追加（端点処理）
    for(var i = 0;i < lineSegData.data.length;i++){
        if(lineSegData.data[i]==1 && startEdge==-1) startEdge=i;
        if(lineSegData.data[i]==0 && startEdge!=-1){ 
            // 辺の追加 startEdgeの左からiの左まで
            if(lineSegLengthMin<=lineSegDetectDiv*(i-startEdge)){ //最小値の要件を満たしているか確認
                if("mx" in myLineSeg.pos) { // mxとMxで管理
                    tempLineSegList.push({
                        alpha:myLineSeg.alpha,
                        beta:myLineSeg.beta,
                        pos:{
                            mx:p[0].x+(p[1].x-p[0].x)*startEdge/(lineSegData.data.length-1),
                            Mx:p[0].x+(p[1].x-p[0].x)*i/(lineSegData.data.length-1)
                        }
                    })
                } else {// myとMyで管理
                    tempLineSegList.push({
                        alpha:myLineSeg.alpha,
                        beta:myLineSeg.beta,
                        pos:{
                            my:p[0].y+(p[1].y-p[0].y)*startEdge/(lineSegData.data.length-1),
                            My:p[0].y+(p[1].y-p[0].y)*i/(lineSegData.data.length-1)                              
                        }
                    })
                }
            }
            startEdge=-1;
        }
    }
    return tempLineSegList;
}

function detectLineSegments(){ // 検出された直線を線分に分ける Objects.linesに入っている直線を直接書き換え、Objects.lineSegmentsへ移動させる
    var tempLine;
    var linesLength=Objects.lines.length;
    var lineSegList=[];
    for(var i = 0;i < linesLength;i++){
        tempLine=Objects.lines.pop();
        tempLine=reshapeLineIntoLineSegment(tempLine);
        lineSegList=JSON.parse(JSON.stringify(verifyLineSegments(tempLine))); //deepcopy
        Objects.lineSegments=Objects.lineSegments.concat(lineSegList);
    }
}

function adjustLine(){ //直線を微修正する
    var maxAlpha,maxBeta,maxScore;
    var score,alpha,beta;
    var adjustLineAlpha=adjustLineParam.alpha*2;
    var adjustLineBeta=adjustLineParam.beta*2;
    var p=[{x:0,y:0},{x:0,y:0}];
    for(var i = 0;i < adjustLineParam.rep;i++){
        adjustLineAlpha/=2; // パラメータの探索幅を半減
        adjustLineBeta/=2;
        for(var j = 0;j < Objects.lines.length;j++){
            maxScore=-1;
            for(var k = -adjustLineParam.div;k <= adjustLineParam.div;k++){
                alpha=Objects.lines[j].alpha+adjustLineAlpha*k/adjustLineParam.div;
                for(var l = -adjustLineParam.div;l <= adjustLineParam.div;l++){
                    beta=Objects.lines[j].beta+adjustLineBeta*l/adjustLineParam.div;
                    p=getLineSegEdge(
                        reshapeLineIntoLineSegment({alpha:alpha,beta:beta})
                    );
                    score=getScoreOfLineSeg(getXPos(p[0].x), getYPos(p[0].y), getXPos(p[1].x), getYPos(p[1].y),adjustLineParam.adjustScoreOfD).score;
                    if(score>maxScore){
                        maxScore=score;
                        maxAlpha=alpha;
                        maxBeta=beta;
                    }
                }
            }
            Objects.lines[j].alpha=maxAlpha;
            Objects.lines[j].beta=maxBeta;
        }    
    }
}

function detectLine(){ // 直線を検出する
    for(var i = 0;i < vertex.length;i++){ // 投票データの抽出
        vertex[i].voteAlpha=vertex[i].atan;
        vertex[i].voteBeta=-Math.sin(vertex[i].atan)*(vertex[i].x/myCanvas[2].width*(maxX-minX)+minX)
                           +Math.cos(vertex[i].atan)*((1-vertex[i].y/myCanvas[2].height)*(maxY-minY)+minY);
    }
    normalizeData("voteAlpha"); // 標準化
    normalizeData("voteBeta");

    for(var i = 0;i < voteDiv;i++){
        lineVote[i]=[];
        for(var j = 0;j < voteDiv;j++){
            lineVote[i][j]=0;
        }
    }
    var votePos1,votePos2;
    for(var i = 0;i < vertex.length;i++){ // 投票
        votePos1=Number(Math.round((vertex[i].voteAlpha-normalizeParam.voteAlpha.min)/(normalizeParam.voteAlpha.max-normalizeParam.voteAlpha.min)*(voteDiv-1)));
        votePos2=Number(Math.round((vertex[i].voteBeta-normalizeParam.voteBeta.min)/(normalizeParam.voteBeta.max-normalizeParam.voteBeta.min)*(voteDiv-1)))
        if(vertex[i].power>1){
            lineVote[votePos1][votePos2]+=4*vertex[i].power;
            lineVote[(votePos1+1+voteDiv)%voteDiv][votePos2]+=2*vertex[i].power;
            lineVote[(votePos1-1+voteDiv)%voteDiv][votePos2]+=2*vertex[i].power;
            lineVote[votePos1][(votePos2+1+voteDiv)%voteDiv]+=2*vertex[i].power;
            lineVote[votePos1][(votePos2-1+voteDiv)%voteDiv]+=2*vertex[i].power;
            lineVote[(votePos1+1+voteDiv)%voteDiv][(votePos2+1+voteDiv)%voteDiv]+=1*vertex[i].power;
            lineVote[(votePos1-1+voteDiv)%voteDiv][(votePos2-1+voteDiv)%voteDiv]+=1*vertex[i].power;
            lineVote[(votePos1+1+voteDiv)%voteDiv][(votePos2+1+voteDiv)%voteDiv]+=1*vertex[i].power;
            lineVote[(votePos1-1+voteDiv)%voteDiv][(votePos2-1+voteDiv)%voteDiv]+=1*vertex[i].power;
        }
    }
    
    clusteringLine(voteDiv,voteDiv*voteDiv*lineDetectThreshold); // 連結成分ごとにクラスタリングする 閾値以下の値は削除

    var alpha,beta,nAlpha,nBeta;
    
    for(var i = 0;i < voteDiv;i++){
        for(var j = 0;j < voteDiv;j++){
//          ctx[3].fillStyle="rgba(255,0,0," + lineVote[i][j]/12 + ")";　　　状況を図示
//          ctx[3].fillRect(i/voteDiv*myCanvas[3].width,j/voteDiv*myCanvas[3].height,myCanvas[3].width/voteDiv,myCanvas[3].height/voteDiv);
            if(lineVote[i][j]==1){ //直線検出
                nAlpha=i/(voteDiv-1)*(normalizeParam.voteAlpha.max-normalizeParam.voteAlpha.min)+normalizeParam.voteAlpha.min;
                nBeta=j/(voteDiv-1)*(normalizeParam.voteBeta.max-normalizeParam.voteBeta.min)+normalizeParam.voteBeta.min;
                alpha=normalizeParam.voteAlpha.mean+normalizeParam.voteAlpha.s*nAlpha;
                beta=normalizeParam.voteBeta.mean+normalizeParam.voteBeta.s*nBeta; //標準化前に戻す
                Objects.lines.push({alpha:alpha,beta:beta});
//                ctx[3].fillStyle="rgba(0,255,0,1)";　　　                  状況を図示
//                ctx[3].fillRect(i/voteDiv*myCanvas[3].width,j/voteDiv*myCanvas[3].height,myCanvas[3].width/voteDiv,myCanvas[3].height/voteDiv);
            }
        }
    }
}