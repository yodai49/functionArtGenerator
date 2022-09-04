// @param
var thresholdOfEdge=0.05;
var thresholdOfVertex=0.05;
var minX,maxX,minY,maxY;
var edgeCol=[255,255,255];  // 1 エッジの表示色 変更不可
var linkEuclidThreshold=1600; // 2 連結を検出する範囲となる円の半径の二乗
var skipV=4,skipH=4;        // 2 頂点を検出する際の間隔
var scoreDiv=5;             // 2 2点間のスコア算出時に何分割するか
var connectionScoreThreshold = 0.7;
                            // 2 2点間のスコア算出時に連結があると判定する最低の割合
var addScoreThreshold = 0.3;// 2 2点間のスコアを加算する時の、エッジに対する色の濃さの割合
var arcNum=128;              // 2 傾き検出の際の角度の分割
var radDiv=16;              // 2 傾き検出の際の半径の分割
var maxRad=16;              // 2 傾き検出の際の投票を取る最大の半径

function resetPreviousData(){
    vertex=[];
    vertexHash={};
}

function generateMaster(){
    resetPreviousData(); // 過去のデータをリセット
    generateEdgeMaster(); // エッジ検出
    generateVertexMaster(); // ベクタ化
    generateFunctionMaster(); // グラフを関数化
}