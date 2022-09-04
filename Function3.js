var lineVote=[];
var voteDiv=200;
var normalizeParam=[];
var lines=[]; //直線　形式は{alpha:--, beta:--} xsinα-ycosα+β=0

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
    for(var i =0;i < lines.length;i++){
        
        posInNP1=(-beta/(Math.cos(alpha)));
        posInNP2=beta/(Math.sin(alpha));
        ctx[2].strokeStyle="rgba(255,0,0,1)";
        ctx[2].lineWidth=1;
        ctx[2].beginPath();
        ctx[2].moveTo(
            0, (1-(posInNP1-minY)/(maxY-minY))*myCanvas[2].height
        );
        ctx[2].lineTo(
            (posInNP2-minX)/(maxX-minX)*myCanvas[2].width,0
        )
        ctx[2].stroke();
    
    }

}

function detectLine(){ // 直線を検出する
    for(var i = 0;i < vertex.length;i++){ // 投票データの抽出
        vertex[i].voteAlpha=vertex[i].atan;
        vertex[i].voteBeta=-Math.sin(vertex[i].atan)*vertex[i].x/myCanvas[2].width*(maxX-minX)+minX
                           +Math.cos(vertex[i].atan)*vertex[i].y/myCanvas[2].height*(maxY-minY)+minY;
    }
    normalizeData("voteAlpha"); // 標準化
    normalizeData("voteBeta");

    for(var i = 0;i < voteDiv;i++){
        lineVote[i]=[];
        for(var j = 0;j < voteDiv;j++){
            lineVote[i][j]=0;
        }
    }
    for(var i = 0;i < vertex.length;i++){ // 投票
        lineVote[Number(Math.round((vertex[i].voteAlpha-normalizeParam.voteAlpha.min)/(normalizeParam.voteAlpha.max-normalizeParam.voteAlpha.min)*(voteDiv-1)))]
                [Number(Math.round((vertex[i].voteBeta-normalizeParam.voteBeta.min)/(normalizeParam.voteBeta.max-normalizeParam.voteBeta.min)*(voteDiv-1)))]++;
    }
    var alpha,beta,nAlpha,nBeta,posInNP1,posInNP2;
    for(var i = 0;i < voteDiv;i++){
        for(var j = 0;j < voteDiv;j++){
            ctx[3].fillStyle="rgba(255,0,0," + lineVote[i][j]/10 + ")";
            ctx[3].fillRect(i/voteDiv*myCanvas[3].width,j/voteDiv*myCanvas[3].height,myCanvas[3].width/voteDiv,myCanvas[3].height/voteDiv);
            if(lineVote[i][j]>voteDiv*voteDiv*0.0001){ //直線検出
                nAlpha=i/(voteDiv-1)*(normalizeParam.voteAlpha.max-normalizeParam.voteAlpha.min)+normalizeParam.voteAlpha.min;
                nBeta=i/(voteDiv-1)*(normalizeParam.voteBeta.max-normalizeParam.voteBeta.min)+normalizeParam.voteBeta.min;
                alpha=normalizeParam.voteAlpha.mean+normalizeParam.voteAlpha.s*nAlpha;
                beta=normalizeParam.voteBeta.mean+normalizeParam.voteBeta.s*nBeta; //標準化前に戻す
                lines.push({alpha:alpha,beta:beta});
                console.log("pushed  (alpha,beta) = (" + posInNP1 + ", " + posInNP2 + ")");
            }
        }
    }
    
    /*
    ctx[3].fillStyle="rgba(255,0,0,0.008)";
    for(var i = 0;i < vertex.length;i++){
        ctx[3].moveTo((vertex[i].voteAlpha/4+0.5)*myCanvas[3].width,
                      (vertex[i].voteBeta/5+0.5)*myCanvas[3].height);
        ctx[3].arc((vertex[i].voteAlpha/4+0.5)*myCanvas[3].width,
                   (vertex[i].voteBeta/5+0.5)*myCanvas[3].height,
                   3,0,Math.PI*2);
        ctx[3].fill();
    }*/
}