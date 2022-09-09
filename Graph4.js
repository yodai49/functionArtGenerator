function drawGraphMaster(){
    drawBaseElements();
    drawLineSegments();
    drawArcs();
    drawPolynomials();
    switchCanvas(3);
}

function drawAxis(){ //　軸とその周囲の数字の描画
    ctx[3].lineWidth=1;
    ctx[3].strokeStyle="rgba(100,100,100,1)";
    ctx[3].beginPath();
    ctx[3].moveTo(getXPos(minX),getYPos(0));
    ctx[3].lineTo(getXPos(maxX),getYPos(0));
    ctx[3].moveTo(getXPos(0),getYPos(minY));
    ctx[3].lineTo(getXPos(0),getYPos(maxY));

    ctx[3].moveTo(getXPos(maxX)-20,getYPos(0)+10); // x軸の右向き矢印
    ctx[3].lineTo(getXPos(maxX),getYPos(0));
    ctx[3].lineTo(getXPos(maxX)-20,getYPos(0)-10);

    ctx[3].moveTo(getXPos(0)+10,getYPos(maxY)+20); // y軸の上向き矢印
    ctx[3].lineTo(getXPos(0),getYPos(maxY));
    ctx[3].lineTo(getXPos(0)-10,getYPos(maxY)+20);

    var fontPosOffset=25;
    ctx[3].fillStyle="rgba(0,0,0,1)";
    ctx[3].font="13pt Century";
    ctx[3].fillText("O",getXPos(0)-fontPosOffset,getYPos(0)+fontPosOffset);
    ctx[3].fillText(maxX,getXPos(maxX)-fontPosOffset*0.7,getYPos(0)+fontPosOffset);
    ctx[3].fillText(minX,getXPos(minX)+fontPosOffset*0.7,getYPos(0)+fontPosOffset);
    ctx[3].fillText(maxY,getXPos(0)-fontPosOffset,getYPos(maxY)+fontPosOffset*0.7);
    ctx[3].fillText(minY,getXPos(0)-fontPosOffset,getYPos(minY)-fontPosOffset*0.7);
    ctx[3].stroke();
}
function drawGrid(){ // グリッドの描画
    var gridSpacing=0.25;
    ctx[3].beginPath();
    ctx[3].strokeStyle="rgba(200,200,200,1)";
    ctx[3].lineWidth=0.5;
    gridSpacing=Math.round((Math.ceil(maxX)-Math.floor(minX)))/8;
    if(gridSpacing>1) gridSpacing=Math.round(gridSpacing);
    for(var i =Math.floor(minX);i < Math.ceil(maxX);i+=gridSpacing){
        ctx[3].moveTo(getXPos(i),getYPos(minY));
        ctx[3].lineTo(getXPos(i),getYPos(maxY));    
    }
    gridSpacing=Math.round((Math.ceil(maxY)-Math.floor(minY)))/8;
    for(var i =Math.floor(minY);i < Math.ceil(maxY);i+=gridSpacing){
        ctx[3].moveTo(getXPos(minY),getYPos(i));
        ctx[3].lineTo(getXPos(maxY),getYPos(i));    
    }
    ctx[3].stroke();
}
function drawBaseElements(){ // 背景と軸の描画
    ctx[3].clearRect(getXPos(minX),getYPos(maxY),getXPos(maxX),getYPos(minY));
    ctx[3].fillStyle="rgba(255,255,255,1)";
    ctx[3].fillRect(getXPos(minX),getYPos(maxY),getXPos(maxX),getYPos(minY));
    drawAxis();
    drawGrid();
}
function drawSpecificWholeLine(myLine){
    var m,M;
    ctx[3].stroke();
    ctx[3].lineWidth=1;
    ctx[3].beginPath();
    ctx[3].strokeStyle=selectedEntireCol;
    if(Math.abs(Math.tan(myLine.alpha))>1){
        m=(minY*Math.cos(myLine.alpha)-myLine.beta)/Math.sin(myLine.alpha);
        M=(maxY*Math.cos(myLine.alpha)-myLine.beta)/Math.sin(myLine.alpha);
        ctx[3].moveTo(getXPos(m),getYPos(minY));
        ctx[3].lineTo(getXPos(M),getYPos(maxY));    
    } else {
        m=(minX*Math.sin(myLine.alpha)+myLine.beta)/Math.cos(myLine.alpha);
        M=(maxX*Math.sin(myLine.alpha)+myLine.beta)/Math.cos(myLine.alpha);
        ctx[3].moveTo(getXPos(minX),getYPos(m));
        ctx[3].lineTo(getXPos(maxX),getYPos(M));    
    }
    ctx[3].stroke();
}
function drawLineSegments(){ // lineSegmentsにある線分を描画する
    var drawPoints=[];
    var nextStrokeStyle="";
    ctx[3].lineWidth=3;
    ctx[3].strokeStyle="rgba(0,0,0,1)";
    for(var i = 0;i < Objects.lineSegments.length;i++){
        ctx[3].beginPath();
        drawPoints=[];
        if("mx" in Objects.lineSegments[i].pos){
            drawPoints.push({
                x:Objects.lineSegments[i].pos.mx,
                y:(Math.sin(Objects.lineSegments[i].alpha)*Objects.lineSegments[i].pos.mx+Objects.lineSegments[i].beta)/Math.cos(Objects.lineSegments[i].alpha)     
            });
        } 
        if("Mx" in Objects.lineSegments[i].pos){
            drawPoints.push({
                x:Objects.lineSegments[i].pos.Mx,
                y:(Math.sin(Objects.lineSegments[i].alpha)*Objects.lineSegments[i].pos.Mx+Objects.lineSegments[i].beta)/Math.cos(Objects.lineSegments[i].alpha)     
            });
        } 
        if("my" in Objects.lineSegments[i].pos){
            drawPoints.push({
                x:(Math.cos(Objects.lineSegments[i].alpha)*Objects.lineSegments[i].pos.my-Objects.lineSegments[i].beta)/Math.sin(Objects.lineSegments[i].alpha),
                y:Objects.lineSegments[i].pos.my
            });
        } 
        if("My" in Objects.lineSegments[i].pos){
            drawPoints.push({
                x:(Math.cos(Objects.lineSegments[i].alpha)*Objects.lineSegments[i].pos.My-Objects.lineSegments[i].beta)/Math.sin(Objects.lineSegments[i].alpha),
                y:Objects.lineSegments[i].pos.My
            });
        }
        if("listID" in Objects.lineSegments[i]){ //リストにあったら
            if(document.getElementById("functionsList").options[Objects.lineSegments[i].listID].selected){ //選択されていたら
                drawSpecificWholeLine({
                    alpha: Objects.lineSegments[i].alpha,
                    beta: Objects.lineSegments[i].beta
                });
                nextStrokeStyle=selectedCol;
            } else {
                nextStrokeStyle=getRGBAText(Objects.lineSegments[i].col);
            }
        } else {
            nextStrokeStyle=getRGBAText(Objects.lineSegments[i].col);
        }
        if(nextStrokeStyle!=ctx[3].strokeStyle){
            if(i!=0) ctx[3].stroke();
            ctx[3].strokeStyle=nextStrokeStyle;
            ctx[3].beginPath();
            ctx[3].lineWidth=3;
        }
        if(drawPoints.length<2){
            console.log("Failed to draw line Segments " + i); //ERROR
        } else {
            ctx[3].moveTo(getXPos(drawPoints[0].x),getYPos(drawPoints[0].y));
            ctx[3].lineTo(getXPos(drawPoints[1].x),getYPos(drawPoints[1].y));    
        }
        ctx[3].stroke();
    }
}
function drawSpecificWholeArc(myArc){
    // 特定の円の全体を薄く描く
    ctx[3].stroke();
    ctx[3].lineWidth=1;
    ctx[3].beginPath();
    ctx[3].strokeStyle=selectedEntireCol;
    ctx[3].moveTo(getXPos(myArc.x)+getXPos(myArc.r)-getXPos(0),getYPos(myArc.y));
    ctx[3].ellipse(
        getXPos(myArc.x), getYPos(myArc.y), 
        Math.abs(getXPos(myArc.r)-getXPos(0)),
        Math.abs(getYPos(myArc.r)-getYPos(0)),
        0, 0, Math.PI*2);
    ctx[3].stroke();
}
function drawArcs(){
    var nextStrokeStyle="";
    ctx[3].lineWidth=3;
    ctx[3].strokeStyle="rgba(0,0,0,1)";
    for(var i = 0;i < Objects.arcs.length;i++){
        ctx[3].beginPath();
        if("listID" in Objects.arcs[i]){ //リストにあったら
            if(document.getElementById("functionsList").options[Objects.arcs[i].listID].selected){ //選択されていたら
                if(editShowAllMode) drawSpecificWholeArc(Objects.arcs[i]);
                nextStrokeStyle=selectedCol;
            } else {
                nextStrokeStyle=getRGBAText(Objects.arcs[i].col);
            }
        } else {
            nextStrokeStyle=getRGBAText(Objects.arcs[i].col);
        }
        if(nextStrokeStyle!=ctx[3].strokeStyle){
            ctx[3].stroke();
            ctx[3].strokeStyle=nextStrokeStyle;
            ctx[3].beginPath();
            ctx[3].lineWidth=3;
        }
        ctx[3].moveTo(
            getXPos(Objects.arcs[i].x)+(Math.abs(getXPos(Objects.arcs[i].r)-getXPos(0)))*Math.cos(Objects.arcs[i].theta1),
            getYPos(Objects.arcs[i].y)+(Math.abs(getYPos(Objects.arcs[i].r)-getYPos(0)))*Math.sin(Objects.arcs[i].theta1));
        ctx[3].ellipse(
            getXPos(Objects.arcs[i].x),
            getYPos(Objects.arcs[i].y),
            Math.abs(getXPos(Objects.arcs[i].r)-getXPos(0)),
            Math.abs(getYPos(Objects.arcs[i].r)-getYPos(0)),
            0,
            Objects.arcs[i].theta1, Objects.arcs[i].theta2)    
        ctx[3].stroke();
    }
}
function getRGBAText(col){
    if(col==undefined) return "rgba(0,0,0,1)";
    return "rgba(" + col.r + "," + col.g + "," + col.b + ",1)";
}
function drawPolynomials(){
    var val1,val2,val1Base,selectDrawFlg=0;
    var posX,posY,initialFlg=0,initialPos,terminalPos,temp;
    ctx[3].lineWidth=3;
    ctx[3].strokeStyle="rgba(0,0,0,1)";
    for(var i = 0;i < Objects.polynomials.length;i++){
        ctx[3].beginPath();
        initialFlg=1;
        if(Objects.polynomials[i].isRev){
            initialPos=getYPos(Objects.polynomials[i].m);
            terminalPos=getYPos(Objects.polynomials[i].M);
        } else {
            initialPos=getXPos(Objects.polynomials[i].m);
            terminalPos=getXPos(Objects.polynomials[i].M);
        }
        if(initialPos>terminalPos){
            temp=initialPos;
            initialPos=terminalPos;
            terminalPos=temp;
        }
        initialPos=Math.floor(initialPos);
        terminalPos=Math.ceil(terminalPos);
        terminalPos =Math.min(myCanvas[3].width-1,Math.min(myCanvas[3].height-1),terminalPos);
        if("listID" in Objects.polynomials[i]){ //リストにあったら
            if(document.getElementById("functionsList").options[Objects.polynomials[i].listID].selected && selectDrawFlg){ //選択されていて、一部を描画時
                ctx[3].strokeStyle=selectedCol;
                ctx[3].lineWidth=3;
                selectDrawFlg=0;
            } else if(document.getElementById("functionsList").options[Objects.polynomials[i].listID].selected && !selectDrawFlg){ //選択されていて、全体描画時                
                if(editShowAllMode) {
                    ctx[3].strokeStyle=selectedEntireCol;
                    ctx[3].lineWidth=1;
                    selectDrawFlg=1;
                } else {
                    ctx[3].strokeStyle=selectedCol;
                    ctx[3].lineWidth=3;
                }
            } else {
                ctx[3].strokeStyle=getRGBAText(Objects.polynomials[i].col);
            }
        } else {
            ctx[3].strokeStyle=getRGBAText(Objects.polynomials[i].col);
        }
        if(selectDrawFlg) { // 曲線の全体描画時
            if(Objects.polynomials[i].isRev){
                initialPos=getYPos(maxY);
                terminalPos=getYPos(minY);
            } else {
                initialPos=getXPos(minX);
                terminalPos=getXPos(maxX);
            }
        }
        for(var j = initialPos;j <= terminalPos;j++){ //キャンバスは縦横が等しいものとする
            if(Objects.polynomials[i].isRev){
                val1Base=getYCrd(j);
            } else {
                val1Base=getXCrd(j);
            }
            val2=0;
            val1=1;
            for(var k = 0;k < Objects.polynomials[i].w.length;k++){
                val2+=Objects.polynomials[i].w[k]*val1;
                val1*=val1Base;
            }
            if(Objects.polynomials[i].isRev){
                posX=getXPos(val2);
                posY=getYPos(val1Base);
            } else {
                posX=getXPos(val1Base);
                posY=getYPos(val2);
            }
            posX=Math.max(-myCanvas[3].width,Math.min(myCanvas[3].width*2,posX)); // 極端な値を補正
            posY=Math.max(-myCanvas[3].height,Math.min(myCanvas[3].height*2,posY));
            if(initialFlg) {
                initialFlg=0;
                ctx[3].moveTo(posX,posY);
            } else {
                ctx[3].lineTo(posX,posY);
            }
        }
        ctx[3].stroke();
        i-=selectDrawFlg;
    }
}