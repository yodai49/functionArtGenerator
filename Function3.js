var lineVote=[];
var voteDiv=200;
var normalizeParam=[];
var Objects={ // 描画する図形の一覧
        lines:[], // 直線　形式は{alpha:--, beta:--} xsinα-ycosα+β=0
    };

function generateFunctionMaster(){
    detectLine();
    drawLine();
    switchCanvas(3);
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

function drawLine(){ //linesにある直線を描画する
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
            ctx[2].strokeStyle="rgba(255,0,0,1)";
            ctx[2].lineWidth=1;
            ctx[2].beginPath();
            ctx[2].moveTo(
                (drawPoints[0].x-minX)/(maxX-minX)*myCanvas[2].width,
                (1-(drawPoints[0].y-minY)/(maxY-minY))*myCanvas[2].height
            );
            ctx[2].lineTo(
                (drawPoints[1].x-minX)/(maxX-minX)*myCanvas[2].width,
                (1-(drawPoints[1].y-minY)/(maxY-minY))*myCanvas[2].height
            );
            ctx[2].stroke();
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
        clusterList.concat(searchCluster([],div,threshold,(x+1)%div,y));
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
            ctx[3].fillStyle="rgba(255,0,0," + lineVote[i][j]/12 + ")";
            ctx[3].fillRect(i/voteDiv*myCanvas[3].width,j/voteDiv*myCanvas[3].height,myCanvas[3].width/voteDiv,myCanvas[3].height/voteDiv);
            if(lineVote[i][j]==1){ //直線検出
                nAlpha=i/(voteDiv-1)*(normalizeParam.voteAlpha.max-normalizeParam.voteAlpha.min)+normalizeParam.voteAlpha.min;
                nBeta=j/(voteDiv-1)*(normalizeParam.voteBeta.max-normalizeParam.voteBeta.min)+normalizeParam.voteBeta.min;
                alpha=normalizeParam.voteAlpha.mean+normalizeParam.voteAlpha.s*nAlpha;
                beta=normalizeParam.voteBeta.mean+normalizeParam.voteBeta.s*nBeta; //標準化前に戻す
                Objects.lines.push({alpha:alpha,beta:beta});
                ctx[3].fillStyle="rgba(0,255,0,1)";
                ctx[3].fillRect(i/voteDiv*myCanvas[3].width,j/voteDiv*myCanvas[3].height,myCanvas[3].width/voteDiv,myCanvas[3].height/voteDiv);
            }
        }
    }
}