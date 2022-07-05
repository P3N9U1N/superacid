import { PolynomEditView, SolutionsView ,MainView, SolutionView} from "./view";
import { ChartView} from "./chartview";
import * as solver from "../src/solver";

let divideOverlay= <HTMLElement> document.getElementById("divideOverlay");

var chartView:ChartView=null;

 var main= new MainView();
 main.setModel({polynomEdit:[null,null,null],solution: 
    [
    ]
} )


main.onbuttonadd= ()=>
{
  if (main.polynomeditview.degree<20) main.polynomeditview.push(null);
}

main.onbuttonremove= ()=>
{
    if (main.polynomeditview.degree>1)  main.polynomeditview.pop();
}

function closeChartView()
{
    if (chartView==null) return;
    chartView.visible=false;
    chartView.dispose();
    chartView=null;
}
main.onbuttonplot= ()=>
{
   var model = main.polynomeditview.getModel();
   history.pushState("", "","")
   chartView = new ChartView();
   chartView.onbuttonclose=()=>{
    closeChartView();
   }
   var derivates= solver.calculateDerivates(model)
   derivates.unshift(model);
   derivates.length=Math.min(3,derivates.length-1);
   var functions=derivates.map((p)=>{return {function:solver.toString(p,4),visible:true }});
   chartView.setModel({visible:true,functions});
}

main.polynomeditview.onkeyenter= ()=>
{   
    solve();  
}

main.onbuttonsolve= ()=>
{
  solve();
}

function formatResult(result:solver.Decimal[])
{
  var r=result.map(p=>p.mul(10000).round().div(10000).toString());
  return r.toString();     
}
function solve()
{
    var m=  main.polynomeditview.getModel();
    var polynom= solver.$(...m);
    var result=solver.solve(polynom, new solver.Decimal("0.000001"),128);  
    if (result==null) return;
    var derivations=solver.calculateDerivates(polynom);
    derivations.unshift(polynom);
    var max=Math.min(result.length-1,2);

    for (var c=max;c>=0;c--)
    {
        var zero=result[c].zeros;
        var p=derivations[c];  
        var solution= formatResult(zero);
        var view=main.solutionsview.add({solution,polynom:p} );   
        if (c==max&&main.solutionsview.size>1)
        {
            view.seperator=true;
        }
    }

    main.solutionsview.scrollToBottom();
}





window.addEventListener("popstate", function(e) {
    //alert("back")
    
   closeChartView();
      
    
});