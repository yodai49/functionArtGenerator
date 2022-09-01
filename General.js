var myCanvas=[];
var ctx=[];

window.addEventListener('DOMContentLoaded', function(){
    for(var i = 0;i < 4;i++) {
        myCanvas[i]= this.document.getElementById("canvasStep" + (i+1));
        ctx[i]=myCanvas[i].getContext("2d");
    }
});
function switchCanvas(canvasNum){ // switch a visible canvas 
    for(var i = 0;i < 4;i++){
        if(i==canvasNum){
            myCanvas[i].style.display = "block";
        } else {
            myCanvas[i].style.display = "none";
        }
    }
}