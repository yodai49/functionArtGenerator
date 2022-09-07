    // 残りのvecを、その場の傾きを利用しながらいくつかのグループに分ける
    // 最適なものを採用して、vecを消去
    // これを繰り返す
    // それぞれのグループを2次関数(x=,y=の形それぞれで試す)や3次関数でフィッティング

var apprxGroupList=[]; // グループ化して近似する点の集合 [[{x:--, y:--},{x:--, y:--},]] の形式で格納していく
var apprxEraseHW=5;
var searchedList;

function approximateVec(){
    var x,y,r2; // r2はx^2+y^2  xとyはピクセル単位
    var dataPos;
    var currentGroupNum=0;

    for(var i = 0;i < vecDiv;i++){
        x=Math.floor(i/vecDiv*myCanvas[2].width);
        for(var j = 0;j < vecDiv;j++){
            y=Math.floor(j/vecDiv*myCanvas[2].height);
            dataPos=4*(x+y*myCanvas[2].width);
            r2=vec[i][j].x*vec[i][j].x+vec[i][j].y*vec[i][j].y;
            if(r2>approximateBeginThreshold*approximateBeginThreshold){
                if(edgeImgData[dataPos]>thresholdOfEdge){ // エッジかつ傾きありなら
                    apprxGroupList[currentGroupNum]=[];
                    apprxGroupList[currentGroupNum].push({ // 初めの点をプッシュ
                        x:x, y:y, tan:vec[i][j].y/vec[i][j].x
                    });
                    apprxGroupList[currentGroupNum]=apprxGroupList[currentGroupNum].concat( // そのままの向き
                        searchApprxGroup(x,y,x+approximateSpacing*vec[i][j].x/Math.sqrt(r2),
                                             y-approximateSpacing*vec[i][j].y/Math.sqrt(r2),0)
                    )
                    apprxGroupList[currentGroupNum]=apprxGroupList[currentGroupNum].concat( // 反転した向き
                        searchApprxGroup(x,y,x-approximateSpacing*vec[i][j].x/Math.sqrt(r2),
                                             y+approximateSpacing*vec[i][j].y/Math.sqrt(r2),0)
                    )
                    for(var k=0;k < apprxGroupList[currentGroupNum].length;k++){
                        eraseNeighborVec(apprxGroupList[currentGroupNum][k].x,
                                         apprxGroupList[currentGroupNum][k].y, apprxEraseHW*3);
                    }
                    currentGroupNum++;
                }
            } 
        }
    }
}

function searchApprxGroup(x1,y1,x2,y2,depth){ // (x1,y1)から(x2,y2)の方向へ行くとき、
    // (x2,y2)周辺で最も直線上(x1,y1)と連結しているエッジ上の点と、その点からさらに連結している点たちの集合を返す [{x:--, y:--}, ...]の形式
    var d=approximateSpacing;
    var x,y,dataPos;
    var vecX,vecY,tan,atan;
    var edgeX=0,edgeY=0;
    var theta,midTheta=Math.atan((y2-y1)/(x2-x1));
    if(x2-x1<0 && Math.cos(midTheta>0)) midTheta+=Math.PI;
    var searchApprxRadDiv=32; //　左右それぞれをこの個数に分割する
    var searchApprxRadRange=Math.PI/3.5; // 左右に、それぞれこの範囲を探索する
    var maxTheta,maxThetaVal=-1,tempScore;
    var tempList=[];
    if(depth>30) return [];
    ctx[2].fillStyle="rgba(255,255,255,1)";
    ctx[2].fillRect(x1,y1,2,2);
    ctx[2].fillStyle="rgba(255,0,0,1)";
    ctx[2].fillRect(x2,y2,2,2); 
    for (var ii = 0;ii < 3;ii++){
        maxThetaVal=-1;
        d=(ii+1)*approximateSpacing;
        for(var i = -searchApprxRadDiv;i<=searchApprxRadDiv;i++){
            theta=midTheta+i/searchApprxRadDiv*searchApprxRadRange; // (x1,y1)から角度theta、距離dだけ移動した点を調査
            x=Math.floor(x1+d*Math.cos(theta));
            y=Math.floor(y1+d*Math.sin(theta));
            vecX=Math.floor(x/myCanvas[3].width*vecDiv);
            vecY=Math.floor(y/myCanvas[3].height*vecDiv);
            ctx[2].fillStyle="rgba(255,0,255,1)";
            ctx[2].fillRect(x,y,2,2);
            if(0<=x && x < myCanvas[2].width){
                if(0 <= y && y < myCanvas[2].height&& 
                  vec[vecX][vecY].x*vec[vecX][vecY].x+vec[vecX][vecY].y*vec[vecX][vecY].y>0){ // 調査対象が範囲内なら
                    dataPos=4*(x+y*myCanvas[2].width);
                    tempScore=1/Math.max(i,1); // それぞれの点のスコアを算出
                    if(i==0) tempScore=2;
                    if(edgeImgData[dataPos]>=thresholdOfEdge){
                        if(maxThetaVal<tempScore){
                            maxTheta=theta;
                            maxThetaVal=tempScore;
                            edgeX+=x;
                            edgeY+=y;
                        }
                    }
                }
            }
        }
        if(maxThetaVal!=-1) break;
    }

    if(maxThetaVal==-1) return []; //終点だったら何も返さない

    x=Math.round(x1+d*Math.cos(maxTheta)); // 次の点の座標をセット
    y=Math.round(y1+d*Math.sin(maxTheta));

    if(0<=x && x < myCanvas[3].width){
        if(0<=y && y < myCanvas[3].height){
            vecX=Math.floor(x/myCanvas[3].width*vecDiv);
            vecY=Math.floor(y/myCanvas[3].height*vecDiv);
            tan=vec[vecX][vecY].y/vec[vecX][vecY].x;
            atan=Math.atan(tan);
            if(vec[vecX][vecY].x<0 && Math.cos(atan)>0) atan+=Math.PI;
            tempList.push({x:x,y:y});
            tempList=tempList.concat( //再帰
                searchApprxGroup(x, y, x+approximateSpacing*Math.cos(atan),y-approximateSpacing*Math.sin(atan),depth+1)
            );
        }
    }

    return tempList;
}

function drawApprxGroups(){ // 近似のグループを可視化する
    var d1,d2,d3,d;
    ctx[3].strokeStyle="rgba(100,100,100,1)";
    ctx[3].lineWidth=1;
    ctx[3].beginPath();
    for(var i = 0;i < apprxGroupList.length;i++){
        if(apprxGroupList[i].length>1){
            for(var j = 0;j < apprxGroupList[i].length;j++){
                d=i;
                d1=d%2;
                d=(d-d1)/2;
                d2=d%2;
                d=(d-d2)/2;
                d3=d%2;
                if(d1*d2*d3==1) d1=d2=d3=0.5; 
                ctx[3].fillStyle="rgba(" + 255*d1 + "," + 255*d2 + "," + 255*d3 + ",1)";
                ctx[3].fillRect(apprxGroupList[i][j].x,apprxGroupList[i][j].y,3,3);
                if(j>0){
                    ctx[3].moveTo(apprxGroupList[i][j-1].x,apprxGroupList[i][j-1].y);
                    ctx[3].lineTo(apprxGroupList[i][j].x,apprxGroupList[i][j].y);
                    ctx[3].stroke();
                }
            }
        }

    }
}

var maxDim=8; // 多項式の次数の最大数+1

function analyzeByMRMaster(){ // 重回帰分析の呼び出しを行う
    var dataSet=[];// {x:--, y:--, xs:[], ys:[]}の形式
    var xs=[],ys=[];
    for(var i = 0;i < apprxGroupList.length;i++){
        dataSet=[];
        for(var j = 0;j < apprxGroupList[i].length;j++){ // データを加工して、回帰の準備
            xs[0]=1;
            ys[0]=1;
            for(var k = 1;k <= maxDim;k++){
                xs[k]=xs[k-1]*getXCrd(apprxGroupList[i][j].x);
                ys[k]=ys[k-1]*getYCrd(apprxGroupList[i][j].y);
            }
            dataSet[j]=
                {
                    x: getXCrd(apprxGroupList[i][j].x),
                    y: getYCrd(apprxGroupList[i][j].y),
                    xs: JSON.parse(JSON.stringify(xs)),
                    ys: JSON.parse(JSON.stringify(ys))
                }
        }
        apprxGroupList[i].mr=analyzeByMR(dataSet);
        Objects.polynomials.push({
            isRev:apprxGroupList[i].mr.isRev,
            w:apprxGroupList[i].mr.w,
            m:searchEdgeVal(apprxGroupList[i],0,apprxGroupList[i].mr.isRev),
            M:searchEdgeVal(apprxGroupList[i],1,apprxGroupList[i].mr.isRev)
        })
    }
}
function searchEdgeVal(pointList,isMax,isY){ // 最小値や最大値の座標を返す関数
    var max=-9999,min=9999;
    for(var i = 0;i < pointList.length;i++){
        if(isY){
            if(pointList[i].y>max) max=pointList[i].y;
            if(pointList[i].y<min) min=pointList[i].y;
        } else {
            if(pointList[i].x>max) max=pointList[i].x;
            if(pointList[i].x<min) min=pointList[i].x;
        }
    }
    if(isY){
        if(isMax) return getYCrd(max);
        if(!isMax) return getYCrd(min);
    } else {
        if(isMax) return getXCrd(max);
        if(!isMax) return getXCrd(min);
    }
}

function analyzeByMR(data){ // 次数の範囲内で、xyの入れ替えも加味した最良の近似式を返す
    var exp=[],target=[];
    var maxScore=-1, maxW=[], isRev,dim;
    var resultOfMR;
    // 目的変数がy
    for(var i = 1;i < Math.min(maxDim, data.length-1);i++){
        exp=[],target=[];
        for(var j = 0;j < data.length;j++){
            exp[j]=JSON.parse(JSON.stringify(data[j].xs));
            target[j]=data[j].y;
        }
        resultOfMR=calcMR(exp,target,i); 
        if(maxScore<resultOfMR.score){
            maxScore=resultOfMR.score;
            maxW=JSON.parse(JSON.stringify(resultOfMR.w));
            isRev=0;
            dim=i;
        }
    }
    // 目的変数がx
    for(var i = 1;i < Math.min(maxDim, data.length); i++){
        exp=[],target=[];
        for(var j = 0;j < data.length;j++){
            exp[j]=JSON.parse(JSON.stringify(data[j].ys));
            target[j]=data[j].x;
        }
        console.log(exp,target);
        resultOfMR=calcMR(exp,target,i); 
        if(maxScore<resultOfMR.score){
            maxScore=resultOfMR.score;
            maxW=JSON.parse(JSON.stringify(resultOfMR.w));
            isRev=1;
            dim=i;
        }
    }
    return {
        score:maxScore,
        w: maxW,
        isRev:isRev,
        dim:dim
    }
}

var maxRep=10000;
var alpha=0.0; //正則化項
var eta=0.01;

function calcMR(exp,target,dim){ // 実際に重回帰分析を行う
    // expは説明変数の配列、targetは目的変数、dimは次元
    var w=[], k;
    var y_h, wSum=0;
    var score=0;
    for(var i = 0;i < dim;i++) w[i]=0;
    // target = w[0] * exp[0] + w[1] * exp[1] + ...
    for(var i = 0;i < maxRep; i++){ 
        k=Math.floor(Math.random()*exp.length);
        y_h=0;
        for(var j=0;j < dim;j++) y_h+=w[j]*exp[k][j];
        for(var j = 0;j < dim;j++){
            w[j] = w[j] - 2*eta*(y_h-target[k])*exp[k][j];
        }
        // ここに終了条件を追加
    }
    score=0;
    for(var i = 0;i < exp.length;i++) { //スコアの算出
        y=0, wSum=0;
        for(var j = 0;j < dim;j++) y+=w[j]*exp[i][j];
        for(var j = 0;j < dim;j++) wSum+=w[j]*w[j];
        score+=(y-target[i])*(y-target[i]); // 残差の二乗和
        score+=alpha*wSum;
    }
    return {
        w: w,
        score:1/((score+0.01)) // 良いほど低いスコアにする
    }
}