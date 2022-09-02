var imgData;
var data;

function generateEdgeMaster(){ // myCanvas[0]の画像をエッジ検出してmyCanvas[1]にセット
    imgData=ctx[0].getImageData(0,0,myCanvas[0].width,myCanvas[0].height);    
    data=imgData.data;
    generateEdge();
    switchCanvas(1);
}

function getSquareOfEuclidDistance(d1,d2){
    return ((d1[0]-d2[0])*(d1[0]-d2[0])+
            (d1[1]-d2[1])*(d1[1]-d2[1])+
            (d1[2]-d2[2])*(d1[2]-d2[2]));
}

function generateEdge(){
    ctx[1].clearRect(0,0,myCanvas[1].width,myCanvas[1].height);
    ctx[1].fillStyle="rgba(255,255,255,1)";
    for(var i = 0;i < data.length/4;i++){
        cIndex=i*4;
        rIndex=(i+1)*4;
        bIndex=(i+myCanvas[0].width)*4;
        if(bIndex>data.length) continue;//最下段はスルー
        if(rIndex%myCanvas[0].width==0) continue; //最右列はスルー
        if(getSquareOfEuclidDistance([data[cIndex],data[cIndex+1],data[cIndex+2]],[data[rIndex],data[rIndex+1],data[rIndex+2]])>thresholdOfEdge*255*255|| 
           getSquareOfEuclidDistance([data[cIndex],data[cIndex+1],data[cIndex+2]],[data[bIndex],data[bIndex+1],data[bIndex+2]])>thresholdOfEdge*255*255){
            //エッジ
            data[cIndex]=edgeCol[0];
            data[cIndex+1]=edgeCol[1];
            data[cIndex+2]=edgeCol[2];
            x=i%myCanvas[1].width;
            y=(i-x)/myCanvas[1].width;
            ctx[1].moveTo(x,y);
            ctx[1].arc(x,y,2,0,Math.PI);
        }
    }
    ctx[1].fill();
}