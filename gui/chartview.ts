
import { View, ViewList } from "./framework";
import * as JXG from "jsxgraph"
type Chart={visible:boolean,functions:Function[]}
export class ChartView extends View<Chart>
{

  private chart:HTMLElement;
  private btnClose:HTMLButtonElement;
  private btnRedraw:HTMLButtonElement;
  functionsView: FunctionsView;
  private board: JXG.Board;
  private colors:string[]=["#A64499","#84d4c9","#fbc994"]
  private graphs:JXG.Functiongraph[]=[];
  constructor()
  {
    super(<HTMLElement> document.getElementById("plotOverlay"));
    this.chart= <HTMLElement> this.element[0].querySelector("#chart");
    this.btnClose= <HTMLButtonElement> this.element[0].querySelector("#btnClose");
    this.btnRedraw= <HTMLButtonElement> this.element[0].querySelector("#btnRedraw");
    this.btnRedraw.onclick= this.onButtonRedraw.bind(this)

    this.functionsView= new FunctionsView();
    this.functionsView.onkeyenter=this.onButtonRedraw.bind(this);
    this.functionsView.onpropertychange=(sender,view,property,value)=>{
      if (property=="visible")
      {
        if (value)
        {     
          var index= this.functionsView.indexOf(view);
          var m= view.getModel();
          var graph=this.addGraph(m.function,this.colors[index]);
          this.graphs[index]=graph;
        } else
        {
          var index= this.functionsView.indexOf(view); 
          this.board.removeObject(this.graphs[index]);
          this.graphs[index]=null;
        }
        
      }
    };
    this.functionsView.onchange=(sender,view,value)=>{
      
    };
  }
  onButtonRedraw () : any
  {
    var model= this.functionsView.getModel();
    this.redraw(model);    

  }
  public get onbuttonclose(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
    return this.btnClose.onclick;
  }
  public set onbuttonclose(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
      this.btnClose.onclick = value;
  }
  
  addGraph(func:string,color:string)
  {
    try
    {
      var d = this.board.jc.snippet(func, true, 'x', true);
    } catch(ex)
    {
      return null;
    }      
    var graph=this.board.create("functiongraph",d,{strokeColor:color});  
    
    return graph;
  }

  redraw(functions:Function[])
  {  
    this.board.removeObject(this.graphs);
    this.graphs.length=0;
    for (var c=0;c< functions.length;c++)
    {
      var f=functions[c];
      if (!f.visible) continue;
      var graph= this.addGraph(f.function,this.colors[c]);
      this.graphs[c]=graph;
    }

  }

  setModel(value: Chart): void {  
    this.visible=value.visible;
    this.functionsView.setModel(value.functions);
     
    if (this.board!=null) JXG.JSXGraph.freeBoard(this.board);
    this.board = JXG.JSXGraph.initBoard('chart',  <Partial<JXG.BoardAttributes>> {
      boundingbox: [-5,5,5,-5],
      keepAspectRatio: true,
      axis: true,    
      showCopyright:false,
      resize: {enabled: true, throttle: 200},
      zoom:true,
      pan:true
    });
    
    this.redraw(value.functions);
 
  }
  getModel(): Chart {
    throw new Error("Method not implemented.");
  }
  dispose(): void {
    
    
    this.btnClose.onclick=null;
    this.btnRedraw.onclick=null;
    this.functionsView.clear();
    this.functionsView.onkeyenter=null;
    if (this.board!=null) JXG.JSXGraph.freeBoard(this.board);
    this.graphs.length=0;
    this.board=null;
  }    


}

type Function= {visible:boolean,function:string}
export class FunctionsView extends ViewList<Function,FunctionView>
{
  public onkeyenter : ()=>void; 
  constructor()
  {
      super(<HTMLElement> document.querySelector("#plotOverlayContainer>.functions"));
      this.element.onkeydown=((ev)=>{
        if (ev.key=="Enter" && this.onkeyenter)
        {         
          this.onkeyenter();
        }            
      });  
  }
  createViewmodel(model: Function): FunctionView {
    var f = new FunctionView();
    f.setModel(model);
    return f;
  }
  dispose(): void {
    this.element.onkeydown=null;
  }
}
export class FunctionView extends View<Function>
{
  visibleView: SliderView;
  functionEditView: FunctionEditView;

  constructor()
  {
    var visibleView= new SliderView();
    var functionEditView= new FunctionEditView();
    super([visibleView.element[0],functionEditView.element[0]]);
    this.visibleView=visibleView;
    this.functionEditView=functionEditView;
    this.visibleView.onchange=(sender,value)=>{
      this.emitPropertyChange("visible",value)
    }
  }
  setModel(value: Function): void {
    this.visibleView.setModel(value.visible);
    this.functionEditView.setModel(value.function)
  }
  getModel(): Function {
    return {function:this.functionEditView.getModel(),visible:this.visibleView.getModel() }
  }
  dispose(): void {
    this.visibleView.dispose();
    this.functionEditView.dispose();
  }

}


export class SliderView extends View<boolean>
{
  private checkbox:HTMLInputElement;
  constructor()
  {
   var l=document.createElement("label");
   l.className="switch"
   var i= document.createElement("input");
   i.type= "checkbox";  
   var s=  document.createElement("span");
   s.className="slider"
   l.appendChild(i);
   l.appendChild(s);
   super(l);
   this.checkbox=i;
  
   i.onchange=()=>{
    var value=this.checkbox.checked;
    this.emitChange(value);
   }
  }
  setModel(value: boolean): void {
    this.checkbox.checked=value;

  }
  getModel(): boolean {
    return this.checkbox.checked;
  }
  dispose(): void {

  }  
}
export class FunctionEditView extends View<string>
{
  private textBox: HTMLInputElement;
  constructor()
  {
    super(<HTMLTemplateElement> document.getElementById("tmplEditFunction"))
    this.textBox= <HTMLInputElement> this.element[0];
  }
  setModel(value: string): void {
    this.textBox.value=value;  
  }
  getModel(): string {
    return this.textBox.value;
  }
  dispose(): void {

  }  
}