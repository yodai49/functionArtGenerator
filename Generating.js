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
var voteDiv=200;            // 3 図形を検出する際の投票の分割数(1次元あたり)
var lineDetectThreshold=0.0015; // 3 直線検出時の閾値　全投票に対する得票の割合
var adjustLineParam={rep:4,alpha:0.04,beta:0.04,div:10,adjustScoreOfD:5};
                            // 3 直線の傾きや位置を微調整する回数など // div*div*4回計算するので注意
var lineSegDetectDiv=5;     // 3 線分を検出する際の分割幅
var lineSegLengthMin=60;    // 3 検出される線分の最小の長さ

var Objects={ // 描画する図形の一覧
    lines:[], //        直線　{alpha:--, beta:--}                   xsinα-ycosα+β=0
    lineSegments:[], // 線分　{alpha:--, beta:--, pos:{mx:--, Mx:--}}   式はlinesと同じ、xmからxMまでを図示する（myとMyも可能、どちらもある場合はxが優先）
    
};

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