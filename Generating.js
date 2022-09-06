// @param
var thresholdOfEdge=0.05;
var thresholdOfVertex=0.05;
var minX,maxX,minY,maxY;
var edgeCol=[255,255,255];  // 1 エッジの表示色 変更不可
var linkEuclidThreshold=1600;   // 2 連結を検出する範囲となる円の半径の二乗
var skipV=4,skipH=4;        // 2 頂点を検出する際の間隔
var scoreDiv=5;             // 2 2点間のスコア算出時に何分割するか
var connectionScoreThreshold = 0.7;
                            // 2 2点間のスコア算出時に連結があると判定する最低の割合
var addScoreThreshold = 0.3;// 2 2点間のスコアを加算する時の、エッジに対する色の濃さの割合
var arcNum=90;              // 2 傾き検出の際の角度の分割
var radDiv=30;              // 2 傾き検出の際の半径の分割
var maxRad=30;              // 2 傾き検出の際の投票を取る最大の半径
var powerThreshold=1;     // 2 傾きの有効データとなる最低power

var vecDiv=270;             // 3 ベクトル場の分割数(1次元あたり)
var vecHW=10;               // 3 ベクトル場に影響する上下左右のマス目数

var voteDiv=200;            // 3 直線を検出する際の投票の分割数(1次元あたり)
var lineDetectThreshold=0.0020; // 3 直線検出時の閾値　全投票に対する得票の割合
var adjustLineParam={rep:4,alpha:0.04,beta:0.04,div:10,adjustScoreOfD:5};
                            // 3 直線の傾きや位置を微調整する回数など // div*div*4回計算するので注意
var lineSegDetectDiv=5;     // 3 線分を検出する際の分割幅
var lineSegLengthMin=60;    // 3 検出される線分の最小の長さ

var voteDivArc=200;         // 3 円の中心を検出する際の分割数(1次元あたり)
var arcDetectThreshold=0.75;// 3 円の中心候補時の最大得票数に占める割合
var arcUnifyWH=10;          // 3 円の中心候補を統合する際の幅 （実際には前後左右で2倍ずつの領域で統合される）
var arcMinLength=150;       // 3 円弧の検出下限長さ
var arcMinRatio=0.5;        // 3 円弧の検出下限割合　検出下限長さの条件といずれかを満たせばよい
var arcMinLengthRequired=50;// 3 円弧の最低長さ（これを満たさないと検出されない）
var arcNumAD=360;            // 3 円検出時の角度の分割数
var radSpacingAD=5;         // 3 円検出時の半径の分割間隔
var minArcRadThreshold =60; // 3 円検出時の最小半径
var adjustArcParam={rep:4,r:0.05,center:0.05, radDiv:5, centerDiv:10};
                            // 3 円の中心や半径を微調整する回数など // centerDiv*centerDiv*radDiv*8 回計算するので注意

var Objects={ // 描画する図形の一覧
    lines:[], //        直線　{alpha:--, beta:--}                   xsinα-ycosα+β=0
    lineSegments:[], // 線分　{alpha:--, beta:--, pos:{mx:--, Mx:--}}   式はlinesと同じ、xmからxMまでを図示する（myとMyも可能、どちらもある場合はxが優先）
    arcs:[],         // 円　 {x:--, y:--, r:--, theta1:--, theta2:--}   theta1<theta<theta2の範囲を描く 
};
var normalizeParam=[];
var vec=[];
for(var i = 0;i < vecDiv;i++) { // ベクトル場の初期化
    vec[i]=[]
    for(var j = 0;j < vecDiv;j++) vec[i][j]={x:0,y:0};
}

function resetPreviousData(){
    vertex=[];
    vertexHash={};
}

function generateMaster(){
    resetPreviousData();        // 過去のデータをリセット
    generateEdgeMaster();       // エッジ検出
    generateVertexMaster();     // ベクタ化
    generateFunctionMaster();   // グラフを関数化
    drawGraphMaster();                // グラフを描画
}