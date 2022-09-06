function drawGraphMaster(){
    drawBaseElements();
    drawLineSegments();
    switchCanvas(3);
    drawArcs();
}

function drawBaseElements(){ // 背景と軸の描画
    ctx[3].clearRect(getXPos(minX),getYPos(maxY),getXPos(maxX),getYPos(minY));
    ctx[3].fillStyle="rgba(255,255,255,1)";
    ctx[3].fillRect(getXPos(minX),getYPos(maxY),getXPos(maxX),getYPos(minY));
    ctx[3].lineWidth=1;
    ctx[3].strokeStyle="rgba(0,0,0,0.5)";
    ctx[3].beginPath();
    ctx[3].moveTo(getXPos(minX),getYPos(0));
    ctx[3].lineTo(getXPos(maxX),getYPos(0));
    ctx[3].moveTo(getXPos(0),getYPos(minY));
    ctx[3].lineTo(getXPos(0),getYPos(maxY));
    ctx[3].stroke();
}
function drawLineSegments(){ // lineSegmentsにある線分を描画する
    var drawPoints=[];
    ctx[3].lineWidth=3;
    ctx[3].strokeStyle="rgba(0,0,0,1)";
    ctx[3].beginPath();
    for(var i = 0;i < Objects.lineSegments.length;i++){
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
        if(drawPoints.length<2){
            console.log("Failed to draw line Segments " + i); //ERROR
        } else {
            ctx[3].moveTo(getXPos(drawPoints[0].x),getYPos(drawPoints[0].y));
            ctx[3].lineTo(getXPos(drawPoints[1].x),getYPos(drawPoints[1].y));    
        }
    }
    ctx[3].stroke();
}

function drawArcs(){
    ctx[3].lineWidth=3;
    ctx[3].strokeStyle="rgba(0,0,0,1)";
    ctx[3].beginPath();
    for(var i = 0;i < Objects.arcs.length;i++){
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
    }
    ctx[3].stroke();
}
