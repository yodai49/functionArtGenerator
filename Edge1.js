function generateEdgeMaster(threshold){ // myCanvas[0]の画像をエッジ検出してmyCanvas[1]にセット
    generateEdge(threshold);
    switchCanvas(1);
}

function getSquareOfEuclidDistance(d1,d2){
    return ((d1[0]-d2[0])*(d1[0]-d2[0])+
            (d1[1]-d2[1])*(d1[1]-d2[1])+
            (d1[2]-d2[2])*(d1[2]-d2[2]));
}

function generateEdge(threshold){
    var imgData=ctx[0].getImageData(0,0,myCanvas[0].width,myCanvas[0].height);
    var data=imgData.data;
    for(var i = 0;i < data.length/4;i++){
        cIndex=i*4;
        rIndex=(i+1)*4;
        bIndex=(i+myCanvas[0].width)*4;
        if(bIndex>data.length){ //最下段はスルー
            data[cIndex]=0;
            data[cIndex+1]=0;
            data[cIndex+2]=0;
            continue;
        } 
        if(rIndex%myCanvas[0].width==0) {
            data[cIndex]=0;
            data[cIndex+1]=0;
            data[cIndex+2]=0;
            continue; //最右列はスルー
        }
        if(getSquareOfEuclidDistance([data[cIndex],data[cIndex+1],data[cIndex+2]],[data[rIndex],data[rIndex+1],data[rIndex+2]])>threshold*255*255|| 
           getSquareOfEuclidDistance([data[cIndex],data[cIndex+1],data[cIndex+2]],[data[bIndex],data[bIndex+1],data[bIndex+2]])>threshold*255*255){
            //エッジ
            data[cIndex]=255;
            data[cIndex+1]=255;
            data[cIndex+2]=255;
        } else {
            //エッジ以外
            data[cIndex]=0;
            data[cIndex+1]=0;
            data[cIndex+2]=0;
        }
    }
    imgData.data=data;
    ctx[1].putImageData(imgData,0,0);
}