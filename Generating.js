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
var powerThreshold=0.5;     // 2 傾きの有効データとなる最低power

var vecDiv=270;             // 3 ベクトル場の分割数(1次元あたり)
var vecHW=10;               // 3 ベクトル場に影響する上下左右のマス目数

var voteDiv=200;            // 3 直線を検出する際の投票の分割数(1次元あたり)
var lineDetectThreshold=0.0010; // 3 直線検出時の閾値　全投票に対する得票の割合
var adjustLineParam={rep:4,alpha:0.04,beta:0.04,div:10,adjustScoreOfD:5};
                            // 3 直線の傾きや位置を微調整する回数など // div*div*4回計算するので注意
var lineSegDetectDiv=5;     // 3 線分を検出する際の分割幅
var lineSegLengthMin=60;    // 3 検出される線分の最小の長さ

var voteDivArc=270;         // 3 円の中心を検出する際の分割数(1次元あたり)
var arcDetectThreshold=0.75;// 3 円の中心候補時の最大得票数に占める割合
var arcUnifyWH=10;          // 3 円の中心候補を統合する際の幅 （実際には前後左右で2倍ずつの領域で統合される）
var minArcScoreThreshold=0.5;  // 3 円の半径として検出されるための最低スコア
var arcMinLength=100;       // 3 円弧の検出下限長さ
var arcMinRatio=0.8;        // 3 円弧の検出下限割合　検出下限長さの条件といずれかを満たせばよい
var arcMinLengthRequired=40;// 3 円弧の最低長さ（これを満たさないと検出されない）
var arcNumAD=360;           // 3 円検出時の角度の分割数
var radSpacingAD=5;         // 3 円検出時の半径の分割間隔
var minArcRadThreshold =50; // 3 円検出時の最小半径

var approximateBeginThreshold=0.1; // 3 点集合の検出を開始する時のvecの大きさの最低値
var approximateSpacing=10;   // 3 点集合を検出する際の点の間隔
var apprxDivScoreThreshold=40;     // 3 近似をやりなおすスコアの基準値
var plyMinLengthThreshold=20;// 3 多項式で表される関数の最小長さ
var maxDim=7; // 多項式の次数の最大数+2

var Objects={ // 描画する図形の一覧
    lines:[], //        直線　   {alpha:--, beta:--}                   xsinα-ycosα+β=0 最後には格納されていないはず
    lineSegments:[], // 線分　   {alpha:--, beta:--, pos:{mx:--, Mx:--}}   式はlinesと同じ、xmからxMまでを図示する（myとMyも可能、どちらもある場合はxが優先）
    arcs:[],         // 円　     {x:--, y:--, r:--, theta1:--, theta2:--}   theta1<theta<theta2の範囲を描く 
    polynomials: [],  // 多項関数　{isRev:0or1, w:[0,1,0,...],m:--, M:--}     (isRevが0のとき) y = w[0] + x * w[1] + x^2 * w[2] + ... (m<=x<=M)
};
var vec=[];

var editShowAllMode=1; // 選択時に全てを薄く表示するか？

var normalizeParam=[];

for(var i = 0;i < vecDiv;i++) { // ベクトル場の初期化
    vec[i]=[]
    for(var j = 0;j < vecDiv;j++) vec[i][j]={x:0,y:0};
}

function resetPreviousData(){
    vertex=[];
    vertexHash={};
    imgData=[];
    data=[];
    arcVote=[];
    normLines=[];
    lineVote=[];
    centerOfArcs=[];
    apprxGroupList=[];
    Objects={
        lines:[], 
        lineSegments:[],
        arcs:[],        
        polynomials: []
    };
    apprxGroupList=[];
}
function generateEntire(){
    resetPreviousData();        // 過去のデータをリセット
    generateEdgeMaster();       // エッジ検出
    generateVertexMaster();     // ベクタ化
    generateFunctionMaster();   // グラフを関数化
    nameFunctions();            // 関数に名前をつける
    setEquationOfFunctions();   // 関数に式を入れる
    setColToObjects();          // 色をセット
    refreshList();              // 関数リストを再作成
    drawGraphMaster();          // グラフを描画
    document.getElementById("stoppingCircle").style.display="flex";
    setGeneralStatus(3);        // 生成完了を通知
}
function generateMaster(){
    document.getElementById("stoppingCircle").style.cssText = 'display:none !important';
    setGeneralStatus(2);
    setTimeout(generateEntire,500);
}