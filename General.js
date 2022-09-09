var myCanvas=[];
var ctx=[];
var vertex=[];

var generalStatus=0; // 0 読み込み待ち　1 生成待ち　2 生成中　3 生成済み

var colOfListText = ["rgba(255,230,230,1)","rgba(230,255,230,1)","rgba(230,230,255,1)"];
var colOfSwitch = ["rgba(100,100,100,1)","rgba(90,150,90,1)"];
var colButtonsCol = [{r:240 ,g:0 ,b:0},{r:255 ,g:118 ,b:5},{r:240 ,g:236 ,b:0},
                    {r:0 ,g:240 ,b:84},{r:0 ,g:180 ,b:240},{r:0 ,g:24 ,b:240},
                    {r:196 ,g:0 ,b:240}, {r:0 ,g:0 ,b:0}]
var selectedCol="rgba(100,200,100,1)";
var selectedEntireCol="rgba(150,150,150,1)";

var langList=[  {name:"loadImg",isVal:0,content:["画像読込","Upload"]},
                {name:"switch1",isVal:1,content:["画像","Img"]},
                {name:"switch4",isVal:1,content:["グラフ","Grph"]},
                {name:"generateButton",isVal:1,content:["関数生成","Generate"]},
                {name:"howtoTitle",isVal:0,content:["使い方","How to use"]},
                {name:"howto1",isVal:0,content:["画像読込ボタンをクリックして、画像を読み込んでください。",
                                                "Click upload button and select your image."]},
                {name:"howto2",isVal:0,content:["関数生成ボタンをクリックして、関数アートを生成してください。",
                                                "Click generate button and wait a moment."]},
                {name:"progressText1",isVal:0,content:["画像を読み込んでください。",
                                                "Upload your image."]},
                {name:"progressText2",isVal:0,content:["関数アートを生成してください。",
                                                "Generate function art."]},
                {name:"progressText3",isVal:0,content:["関数アートを生成中です。",
                                                "Generating..."]},
                {name:"progressText4",isVal:0,content:["関数アートが生成されました。",
                                                "Generated!"]},
                {name:"changeSelect",isVal:1,content:["選択解除", "Deselect"]},
                {name:"deleteFunctionButton",isVal:1,content:["関数を削除", "Delete"]},
                {name:"downloadGraphButton",isVal:1,content:["グラフをダウンロード", "Download"]},
                {name:"exp1",isVal:0,content:["誰でも手軽に、お好きな画像から関数アートを生成することができるツールです。", 
                                              "You can generate function art from your preferred picture using this tool."]},
                {name:"exp2",isVal:0,content:["画像によっては、関数アートの生成に数十秒かかることがあります。", 
                                              "Generating process may take about half a minute."]},
                {name:"exp3",isVal:0,content:["関数アートの生成に用いている技術は<a href=\"./tech.html\">こちら</a>をご覧ください。", 
                                              "If you are interested in the technology of this tool, visit <a href=\"./tech.html\">here</a>."]}]

                

var objectsDefaultName=[["線分", "Line Segment"],
                        ["円弧", "Arc"],
                        ["曲線", "Curve"],
                        ["線", "Line"]];
var lang=0;

window.addEventListener('DOMContentLoaded', function(){
    minX=-1; // 今は固定
    maxX=1;
    maxY=1;
    minY=-1;
    for(var i = 0;i < 4;i++) {
        myCanvas[i]= this.document.getElementById("canvasStep" + (i+1));
        ctx[i]=myCanvas[i].getContext("2d");
    }
    drawGraphMaster();
    switchCanvas(3);
    refreshListSelect();
    changeLang(0);
    setGeneralStatus(0);
    myCanvas[3].addEventListener("click", e=>{detectClickCanvas(e)});
});
function switchCanvas(canvasNum){ // switch a visible canvas 
    for(var i = 0;i < 4;i++){
        ctx[i].globalAlpha=1;
        if(i==canvasNum){
            myCanvas[i].style.display = "block";
        } else {
            myCanvas[i].style.display = "none";
        }
    }
    if(canvasNum==0){
        document.getElementById("switch4").style.backgroundColor=colOfSwitch[0];
        document.getElementById("switch1").style.backgroundColor=colOfSwitch[1];
    } else if(canvasNum==3){
        document.getElementById("switch4").style.backgroundColor=colOfSwitch[1];
        document.getElementById("switch1").style.backgroundColor=colOfSwitch[0];
    }
}
function resetCanvas(){ // 処理用のcanvasをリセット
    for(var i = 0;i < 4;i++){
        ctx[i].stroke();
        ctx[i].fill();
        ctx[i].clearRect(0,0,myCanvas[i].width,myCanvas[i].height);    
    }
}

function normalizeData(keyName){ //データの標準化を行う関数
    var mean=0,s=0;
    var min=9999,max=-9999;
    for(var i = 0;i < vertex.length;i++){ // 平均を算出
        mean+=vertex[i][keyName];
    }
    mean/=vertex.length;
    for(var i = 0;i < vertex.length;i++){ // 標準偏差を算出
        s+=(vertex[i][keyName]-mean)*(vertex[i][keyName]-mean);
    }
    s/=vertex.length;
    s=Math.sqrt(s);
    for(var i = 0;i < vertex.length;i++){
        vertex[i][keyName]=(vertex[i][keyName]-mean)/s;
        if(max<vertex[i][keyName]) max=vertex[i][keyName];
        if(min>vertex[i][keyName]) min=vertex[i][keyName];
    }
    normalizeParam[keyName]={};
    normalizeParam[keyName].mean=mean; // 標準偏差と平均を記録しておく
    normalizeParam[keyName].s=s;
    normalizeParam[keyName].max=max;
    normalizeParam[keyName].min=min;
}

function getXPos(xVal){ // 座標平面上の値からキャンバス上の値に変換する
    return (xVal-minX)/(maxX-minX)*myCanvas[3].width;
}
function getYPos(yVal){ // 座標平面上の値からキャンバス上の値に変換する
    return (1-(yVal-minY)/(maxY-minY))*myCanvas[3].height;
}
function getXCrd(xVal){ // キャンバス上の値から座標平面上の値に変換する
    return xVal/myCanvas[3].width*(maxX-minX)+minX;
}
function getYCrd(yVal){ // キャンバス上の値から座標平面上の値に変換する
    return (1-yVal/myCanvas[3].height)*(maxY-minY)+minY;
}

function nameFunctions(){
    // 名前がついていない関数に名前をつける
    for(var i = 0;i < Objects.lineSegments.length;i++){
        if(!("name" in Objects.lineSegments[i])){
            Objects.lineSegments[i].name=objectsDefaultName[0][lang] + (i+1);
        }
    }
    for(var i = 0;i < Objects.arcs.length;i++){
        if(!("name" in Objects.arcs[i])){
            Objects.arcs[i].name=objectsDefaultName[1][lang] + (i+1);
        }
    }
    for(var i = 0;i < Objects.polynomials.length;i++){
        if(!("name" in Objects.polynomials[i])){
            if(Objects.polynomials[i].w.length<3){
                Objects.polynomials[i].name=objectsDefaultName[3][lang] + (i+1);
            } else {
                Objects.polynomials[i].name=objectsDefaultName[2][lang] + (i+1);
            }
        }
    }
}
function setColToObjects(){
    for(var i = 0;i < Objects.lineSegments.length;i++){
        Objects.lineSegments[i].col=JSON.parse(JSON.stringify(colButtonsCol[7]));
    }
    for(var i = 0;i < Objects.arcs.length;i++){
        Objects.arcs[i].col=JSON.parse(JSON.stringify(colButtonsCol[7]));
    }
    for(var i = 0;i < Objects.polynomials.length;i++){
        Objects.polynomials[i].col=JSON.parse(JSON.stringify(colButtonsCol[7]));
    }
}
function getShortEquationFromEquation(myStr){
    if(myStr.indexOf("\\") != -1){
        myStr=myStr.substr(0,myStr.indexOf("\\"));
    }
    if(myStr.length>25) myStr=myStr.substr(0,13) + "...";
    return myStr;
}
function getArcShortEquation(myObj){
    return "r="+(myObj.r).toFixed(3) + ", x="+(myObj.x).toFixed(3) + ", y=" + (myObj.y).toFixed(3);
}
function getSgn(num){
    if(num>0){
        return "+" + num;
    } else {
        return "-" + Math.abs(num);
    }
}
function getLineSegmentEquation(myObj){
    var coef0,coef1,m,M;
    var p=[{x:0,y:0},{x:0,y:0}];
    p=getLineSegEdge(myObj);
    if(Math.abs(Math.tan(myObj.alpha))>1){
        // 標準形で返す
        coef0=(Math.sin(myObj.alpha)).toFixed(3);
        coef1=(Math.cos(myObj.alpha)).toFixed(3)/coef0;
        if(p[0].y<p[1].y){
            m = p[0].y;
            M = p[1].y;
        } else {
            m = p[1].y;
            M = p[0].y;
        }
        m=m.toFixed(3);
        M=M.toFixed(3);
        return "x" + getSgn(coef1.toFixed(3)) + "y" + getSgn((myObj.beta/coef0).toFixed(3)) + "=0\\\\ (" + m + "\\leq y\\leq" + M + ")";
    } else {
        coef0=Math.tan(myObj.alpha).toFixed(3);
        coef1=(myObj.beta/Math.cos(myObj.alpha)).toFixed(3);    
        if(p[0].x<p[1].x){
            m = p[0].x;
            M = p[1].x;
        } else {
            m = p[1].x;
            M = p[0].x;
        }
        m=m.toFixed(3);
        M=M.toFixed(3);
        return "y=" + coef0 + "x" + getSgn(coef1) + "\\\\ (" + m + "\\leq x\\leq" + M + ")";
    }
}
function getArcEquation(myObj){
    return "x=" + (myObj.r).toFixed(3) + "\\cos\\theta" + getSgn((myObj.x).toFixed(3))+ "\\\\" + 
           "y=" + (myObj.r).toFixed(3) + "\\sin\\theta" + getSgn((myObj.y).toFixed(3))+ "\\\\"+
           "(" + ((-myObj.theta2+2*Math.PI)/Math.PI).toFixed(3)+ "\\pi\\leq\\theta\\leq" + ((-myObj.theta1+2*Math.PI)/Math.PI).toFixed(3)+"\\pi)";
}
function getPowStr(pow){
    if(pow==1) return "";
    return "^" + pow;
}
function getPolynomialEquation(myObj){
    var char1,char2,str;
    if(myObj.isRev) {
        char1="y";
        char2="x";
    } else {
        char1="x";
        char2="y";
    }
    str=char2 + "=";
    for(var i = myObj.w.length-1;i >=0;i--){
        if(i==0) {
            if(myObj.w.length==1){ // 1.23
                str+=(myObj.w[i]).toFixed(3);
            } else { // + 1.23
                str+=getSgn((myObj.w[i]).toFixed(3));
            }
        } else if(i==myObj.w.length-1){
            str+=(myObj.w[i]).toFixed(3) + char1 + getPowStr(i);
        }else {
            str+=getSgn((myObj.w[i]).toFixed(3)) + char1 + getPowStr(i);
        }
    }
    str+="\\\\(" + (myObj.m).toFixed(3) + "\\leq " + char1 + "\\leq " + (myObj.M).toFixed(3) + ")";
    return str;
}
function setEquationEach(myObj,kind){
    for(var i = 0;i < myObj.length;i++){
        if(kind==0) myObj[i].equation = getLineSegmentEquation(myObj[i]);
        if(kind==1) myObj[i].equation = getArcEquation(myObj[i]);
        if(kind==2) myObj[i].equation = getPolynomialEquation(myObj[i]);
        if(kind==0) myObj[i].shortEquation = getShortEquationFromEquation(myObj[i].equation);
        if(kind==1) myObj[i].shortEquation = getArcShortEquation(myObj[i]);
        if(kind==2) myObj[i].shortEquation = getShortEquationFromEquation(myObj[i].equation);
    }
}
function setEquationOfFunctions(){
    // 関数の式がセットされていない関数に式をセットする　.equationにMathJaxで直接処理できる形で入れる
    setEquationEach(Objects.lineSegments,0);
    setEquationEach(Objects.arcs,1);
    setEquationEach(Objects.polynomials,2);
}

function detectClickCanvas(e){ //　キャンバスのクリック時
    const   rect = e.target.getBoundingClientRect(); 
    const   viewX = e.clientX - rect.left,
            viewY = e.clientY - rect.top;
    const   scaleWidth =  myCanvas[3].clientWidth / myCanvas[3].width,
            scaleHeight =  myCanvas[3].clientHeight / myCanvas[3].height;
    const   canvasX = Math.floor( viewX / scaleWidth ),
            canvasY = Math.floor( viewY / scaleHeight );
    const   clickedX=getXCrd(canvasX),
            clickedY=getYCrd(canvasY);
    var minD={d:0.01,ID:-1}, tempD;
    tempD=calcMinD_LS(Objects.lineSegments,clickedX,clickedY);
    if(tempD.d<minD.d) minD=JSON.parse(JSON.stringify(tempD));
    tempD=calcMinD_AR(Objects.arcs,clickedX,clickedY);
    if(tempD.d<minD.d) minD=JSON.parse(JSON.stringify(tempD));
    tempD=calcMinD_PL(Objects.polynomials,clickedX,clickedY);
    if(tempD.d<minD.d) minD=JSON.parse(JSON.stringify(tempD));
    if(minD.ID!=-1){
        if(!e.shiftKey){
            for(var i = 0;i < document.getElementById("functionsList").options.length;i++){
                document.getElementById("functionsList").options[i].selected=0;
            }
        }
        document.getElementById("functionsList").options[minD.ID].selected= // 選択状態を反転する
            1-document.getElementById("functionsList").options[minD.ID].selected;
    } else {
        selectAll(0);
    }
    refreshListSelect();
}

var detectSelectDiv=50;

function calcMinD_LS(myObj,x,y){ // LineSegmentsと(x,y)の距離の最小値を計算して返す　x,yは座標平面上
    var tempD={d:9999,ID:-1},d=9999,p=[],myX,myY;
    for(var i = 0;i < myObj.length;i++){
        d=9999;
        p=JSON.parse(JSON.stringify(getLineSegEdge(
            JSON.parse(JSON.stringify(myObj[i])))));
        for(var j= 0;j <= detectSelectDiv;j++){
            myX=p[0].x+(p[1].x-p[0].x)*j/detectSelectDiv;
            myY=p[0].y+(p[1].y-p[0].y)*j/detectSelectDiv;
            d=(x-myX)*(x-myX)+(y-myY)*(y-myY);
            if(tempD.d>d){
                tempD.d=d;
                tempD.ID=myObj[i].listID;
            }
        }
    }
    return tempD;
}
function calcMinD_AR(myObj,x,y){// Arcsと(x,y)の距離の最小値を計算して返す　x,yは座標平面上
    var tempD={d:9999,ID:-1}, myTheta=0;
    for(var i = 0;i < myObj.length;i++){
        d=9999;
        for(var j= 0;j <= detectSelectDiv;j++){
            myTheta=myObj[i].theta1+(myObj[i].theta2-myObj[i].theta1)*j/detectSelectDiv;
            myX=myObj[i].x+myObj[i].r*Math.cos(myTheta);
            myY=myObj[i].y-myObj[i].r*Math.sin(myTheta);
            d=(x-myX)*(x-myX)+(y-myY)*(y-myY);
            if(tempD.d>d){
                tempD.d=d;
                tempD.ID=myObj[i].listID;
            }
        }
    }
    return tempD;
}
function calcMinD_PL(myObj,x,y){// Polynomialsと(x,y)の距離の最小値を計算して返す　x,yは座標平面上
    var tempD={d:9999,ID:-1};
    var p=[{x:0,y:0},{x:0,y:0}],tempVal;
    for(var i = 0;i < myObj.length;i++){
        d=9999;
        if(myObj[i].isRev){
            // x= y+...
            p[0].y=myObj[i].m;
            p[1].y=myObj[i].M;
        } else {
            p[0].x=myObj[i].m;
            p[1].x=myObj[i].M;
        }
        for(var j= 0;j <= detectSelectDiv;j++){
            if(myObj[i].isRev){
                myY=p[0].y+(p[1].y-p[0].y)*j/detectSelectDiv;
                myX=0;
                tempVal=1;
                for(var k = 0;k < myObj[i].w.length;k++){
                    myX+=tempVal*myObj[i].w[k];
                    tempVal*=myY;
                }
            } else {
                myX=p[0].x+(p[1].x-p[0].x)*j/detectSelectDiv;
                myY=0;
                tempVal=1;
                for(var k = 0;k < myObj[i].w.length;k++){
                    myY+=tempVal*myObj[i].w[k];
                    tempVal*=myX;
                }
            }
            d=(x-myX)*(x-myX)+(y-myY)*(y-myY);
            if(tempD.d>d){
                tempD.d=d;
                tempD.ID=myObj[i].listID;
            }
        }
    }
    return tempD;
}
                                                
function changeLang(langNum){
    // langNum = 0 日本語　1 英語
    lang=langNum;
    for(var i = 0;i < langList.length;i++){
        if(langList[i].isVal){
            document.getElementById(langList[i].name).value=langList[i].content[langNum];
        } else {
            document.getElementById(langList[i].name).innerHTML=langList[i].content[langNum];
        }
    }
}

function setGeneralStatus(status){ //generalStatusをstatusに変更する
    generalStatus=status;
    for(var i = 0;i < 4;i++){
        if(i==generalStatus) {
            document.getElementById("progressText" + (i+1)).style.display = 'flex';
        } else {
            document.getElementById("progressText" + (i+1)).style.cssText = 'display:none !important';
        }
    }
    if(status==3){
        document.getElementById("downloadGraphButton").disabled=false;
    } else {
        document.getElementById("downloadGraphButton").disabled=true;
    }
}