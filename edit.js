function refreshList(){
    // 関数のリストを更新する
    var listNum=document.getElementById("functionsList").options.length;
    for(var i = 0;i < listNum;i++){
        document.getElementById("functionsList").options[0]=null;
    }
    makeEachList(Objects.lineSegments,0);
    makeEachList(Objects.arcs,1);
    makeEachList(Objects.polynomials,2);
}
function getColText(col){
    // colを薄くした色をrgba--,の形式で返す
    if(col==undefined) return "rgba(255,255,255,1)";
    var r,g,b;
    r=(col.r*2+255*6)/8;
    g=(col.g*2+255*6)/8;
    b=(col.b*2+255*6)/8;
    return "rgba(" + r + "," + g + "," + b + ",1)";
}
function makeEachList(myObj,kind){ // 関数の表示用のリストを作成する
    for(var i = 0;i < myObj.length;i++){ 
        document.getElementById("functionsList").options[document.getElementById("functionsList").options.length]
            = new Option(myObj[i].name + "　(" + myObj[i].shortEquation + ")");
        document.getElementById("functionsList").options[document.getElementById("functionsList").options.length-1].style.backgroundColor=
            getColText(myObj[i].col);
        myObj[i].listID=document.getElementById("functionsList").options.length-1;
        myObj[i].kind=kind;
    }
}

function refreshListSelect(){ // リストの選択項目が変更された時
    var selectedCnt=0;
    refreshColButton();
    drawEquation();
    drawFunctionData();
    drawGraphMaster();
    var selectedFlg=0;
    for(var i = 0;i < document.getElementById("functionsList").options.length;i++){
        if(document.getElementById("functionsList").options[i].selected==1){
            selectedFlg=1;
            selectedCnt++;
        }
    }
    if(selectedFlg){
        document.getElementById("deleteFunctionButton").disabled=false;
        document.getElementById("changeSelect").disabled=false;
    } else {
        // 一つも選択されていない場合
        document.getElementById("deleteFunctionButton").disabled=true;
        document.getElementById("changeSelect").disabled=true;
    }
    if(selectedCnt<2){ // 0個か1個か
        document.getElementById("otherFunction").style.cssText = 'display:none !important';
    } else {
        document.getElementById("otherFunction").innerHTML="他" + (selectedCnt-1) + "件";
        document.getElementById("otherFunction").style.display = 'flex';
    }
    document.getElementById("functionsList").focus();
}
function downloadGraph(){ //　グラフを保存する処理
	var a = document.createElement('a');
	a.href = myCanvas[3].toDataURL('image/jpeg', 0.85);
	a.download = 'myGraph.jpg';
	a.click();
}
function searchListedObj(listNum,myObj){ // myObjからlistNumのlistIDを持つオブジェクトの配列を返す　見つからなかったら空
    for(var i = 0;i < myObj.length;i++){
        if(myObj[i].listID==listNum) return [myObj[i]];
    }
    return [];
}

function searchSelectedObj(isOnly){
    // 選択状態にあるオブジェクトの集合を配列で返す　isOnlyを指定すると一番上のもののみ返す
    var detectedList=[];
    for(var i = 0;i < document.getElementById("functionsList").options.length;i++){
        if(document.getElementById("functionsList").options[i].selected){
            detectedList=detectedList.concat(searchListedObj(i,Objects.lineSegments));
            detectedList=detectedList.concat(searchListedObj(i,Objects.arcs));
            detectedList=detectedList.concat(searchListedObj(i,Objects.polynomials));
        }
        if(isOnly && detectedList.length!=0) return detectedList;
    }
    return detectedList;
}

function drawEquation(){ // 選択状態にある数式のうち一番上のものの式を描画する
    var eqEle=document.getElementById("equation");
    var selectedObj=searchSelectedObj(1)[0];
    if(selectedObj==undefined) return;
    eqEle.innerHTML="\\[" + selectedObj.equation + "\\]";
    MathJax.Hub.Typeset(eqEle);
}

function drawFunctionData(){
    var selectedObj=searchSelectedObj(1)[0];
    if(selectedObj==undefined) return;
    for(var i = 0;i < 2;i++){
        for(var j = 0; j <7;j++){
            document.getElementById("data" + (j+1) +""+ (i+1)).innerHTML="";
        }
    }
    if(selectedObj.kind==0){ //線分
        p=getLineSegEdge(selectedObj);
        document.getElementById("data12").innerHTML=(p[0].x).toFixed(3);
        document.getElementById("data22").innerHTML=(p[0].y).toFixed(3);
        document.getElementById("data32").innerHTML=(p[1].x).toFixed(3);
        document.getElementById("data42").innerHTML=(p[1].y).toFixed(3);
        document.getElementById("data11").innerHTML="x1";
        document.getElementById("data21").innerHTML="y1";
        document.getElementById("data31").innerHTML="x2";
        document.getElementById("data41").innerHTML="y2";
    } else if(selectedObj.kind==1){ // 円
        document.getElementById("data12").innerHTML=(selectedObj.r).toFixed(3);
        document.getElementById("data22").innerHTML=(selectedObj.x).toFixed(3);
        document.getElementById("data32").innerHTML=(selectedObj.y).toFixed(3);
        document.getElementById("data42").innerHTML=((-selectedObj.theta2+2*Math.PI)/Math.PI).toFixed(3)+"π";
        document.getElementById("data52").innerHTML=((-selectedObj.theta1+2*Math.PI)/Math.PI).toFixed(3)+"π";
        document.getElementById("data11").innerHTML="r";
        document.getElementById("data21").innerHTML="x";
        document.getElementById("data31").innerHTML="y";
        document.getElementById("data41").innerHTML="theta1";
        document.getElementById("data51").innerHTML="theta2";
    } else if(selectedObj.kind==2){ // 多項式
        for(var i = 0;i < selectedObj.w.length;i++){
            document.getElementById("data" + (i+1) +"1").innerHTML="coef" + i;
            document.getElementById("data" + (i+1) + "2").innerHTML=(selectedObj.w[i]).toFixed(3);
        }
    }
}

function deleteFunction(){
    // 選択状態にある関数を削除する
    deleteEachSegment(Objects.lineSegments);
    deleteEachSegment(Objects.arcs);
    deleteEachSegment(Objects.polynomials);
    refreshList();
    drawGraphMaster(); // グラフを際描画
}

function deleteEachSegment(myObj){
    for(var i = myObj.length-1;i >=0 ;i--){
        if("listID" in myObj[i]){
            if(document.getElementById("functionsList").options[myObj[i].listID].selected){
                myObj.splice(i,1);
            }
        }
    }
}

function selectAll(val){
    for(var i = 0;i < document.getElementById("functionsList").options.length;i++){
        document.getElementById("functionsList").options[i].selected=val;
    }
    refreshListSelect();
}
function refreshColButton(){ // 選択中のオブジェクトの色ボタンをアクティベート
    var selectedObj=searchSelectedObj(0);
    for(var i = 0; i < colButtonsCol.length;i++){
        document.getElementById("button" + (i+1)).style.borderStyle="none";
    }
    for(var i = 0; i < selectedObj.length;i++){
        for(var j = 0;j < colButtonsCol.length;j++){
            if("col" in selectedObj[i]){
                if (selectedObj[i].col.r==colButtonsCol[j].r && 
                    selectedObj[i].col.g==colButtonsCol[j].g &&
                    selectedObj[i].col.b==colButtonsCol[j].b){
                        document.getElementById("button" + (j+1)).style.borderStyle="solid";
                }
            }
        }
    }
}
function changeColor(colNum){
    // ここに色の変更処理
    var selectedObj=searchSelectedObj(0);
    for(var i = 0; i < selectedObj.length;i++){
        selectedObj[i].col={};
        selectedObj[i].col.r=colButtonsCol[colNum].r;
        selectedObj[i].col.g=colButtonsCol[colNum].g;
        selectedObj[i].col.b=colButtonsCol[colNum].b;
    }
    refreshColButton();
    refreshList();
    drawGraphMaster();
    document.getElementById("functionsList").focus();
}