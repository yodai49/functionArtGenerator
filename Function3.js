function generateFunctionMaster(){
    detectLine();
    adjustLine();
    drawLineToPicture(1);
    detectLineSegments();
    detectArc();
//    adjustArc();
    drawArcsToPicture();
}