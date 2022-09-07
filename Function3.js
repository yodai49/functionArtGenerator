function generateFunctionMaster(){
    detectLine();
    adjustLine();
    drawLineToPicture(1);
    detectLineSegments();
    eraseDetectedElements();
    detectArc();
//    adjustArc();
    drawArcsToPicture();
    eraseDetectedElements();
    drawVec();
    approximateVec();
    analyzeByMRMaster();
}