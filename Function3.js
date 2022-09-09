function generateFunctionMaster(){
    detectLine();
    adjustLine();
    drawLineToPicture(1);
    detectLineSegments();
    eraseDetectedElements();
    detectArc();
    drawArcsToPicture();
    eraseDetectedElements();
    drawVec();
    approximateVec();
    analyzeByMRMaster();
    adjustApproximate();
}