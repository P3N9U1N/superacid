import { View, ViewList } from "./framework";
import { Decimal } from "../src/solver";
type Solution={polynom:Decimal[],solution:string}

export class SolutionsView extends ViewList<Solution,SolutionView>
{

    private tableContainer=<HTMLElement> document.getElementById("tableContainer");
    constructor()
    {
        super(<HTMLElement> document.getElementById("table").getElementsByTagName("tbody")[0]);
    }

    createViewmodel(model: Solution): SolutionView {
       var view= new SolutionView();
       view.setModel(model);
       return view;
    }   
    scrollToBottom()
    { 
      this.tableContainer.scrollTo(0,this.tableContainer.scrollHeight);
    }
    dispose(): void {
      
    }
}
export class SolutionView extends View<Solution>
{
    polynom:PolynomView;
    private static tmplDisplaySolution =<HTMLTemplateElement> document.getElementById("tmplDisplaySolution");
    constructor()
    {
        super(<HTMLTemplateElement> document.getElementById("tmplDisplayRow"));
        this.polynom= new PolynomView();
    }

   
    public get seperator(): boolean {
        return this.element[0].classList.contains("seperator");
    }
    public set seperator(value: boolean) {
        if (value)
        {
            this.element[0].classList.add("seperator");
        } else
        {
            this.element[0].classList.remove("seperator");
        }
    }
    setModel(value:Solution): void {  
        
        this.polynom.setModel(value.polynom);
        var tr= this.element[0];    
        
        var c1=<HTMLElement>tr.children[0];
        c1.innerHTML="";
        c1.appendChild(this.polynom.element[0])

        var displaySolution=(<HTMLElement> SolutionView.tmplDisplaySolution.content.cloneNode(true)).querySelector(".displaysolution");
        displaySolution.innerHTML=value.solution;
        var c2=tr.children[1];
        c2.innerHTML="";
        c2.appendChild(displaySolution);
       
    }

    dispose(): void {
      
    }
    getModel(): Solution {
        throw new Error("Method not implemented.");
    }
}

export class PolynomView extends View<Decimal[]>
{

    private static tmplXtext =<HTMLTemplateElement> document.getElementById("tmplXtext");
    constructor()
    {
        super(<HTMLTemplateElement> document.getElementById("tmplFormula"))
    }

    setModel(value:Decimal[]): void {       
        this.element[0].innerHTML="";
        var degree=value.length-1;       
        var first=true;
        for (var c=0;c<value.length;c++)
        { 
            var v=value[c];
            if(v.isZero()) 
            {     
            continue;
            }
            var xtext= <HTMLElement>PolynomView.tmplXtext.content.cloneNode(true);
            var factor= <HTMLInputElement> xtext.querySelector(".factor") ;
            factor.innerHTML= v.abs().mul(10000).round().div(10000).toString();
            if (c!=degree) 
            {
            xtext.querySelector(".variablename").innerHTML="x";
            var exponent=<HTMLElement> xtext.querySelector(".exponent");
            exponent.innerHTML=(degree-c).toString();
            if (c==degree-1) exponent.style.display="none";
            
            }

            if (!first || v.isNegative())
            {
                var sign=v.isPositive()   ?"+":"-";
                if (!first) sign+=" ";
                xtext.querySelector(".sign").innerHTML=sign;
            }
            this.element[0].appendChild(xtext);  
            first=false;
        }
    }

    dispose(): void {
       
    }
    getModel(): Decimal[] {
        throw new Error("Method not implemented.");
    }


}


export class PolynomEditView extends View<Array<Decimal>>
{
  
    public get degree(): number {
        return this.factorEditViews.length-1;
    }

    private editRowContainer:HTMLElement;
    private factorEditViews:FactorEditView[]=[];
    public onkeyenter : ()=>void; 
    constructor()
    {
        super(<HTMLTemplateElement> document.getElementById("tmplEditRow"))
        this.editRowContainer=this.element[0];
        
        this.editRowContainer.onkeydown=((ev)=>{
            if (ev.key=="Enter" && this.onkeyenter)
            {         
              this.onkeyenter();
            }            
          });  
    }
    setModel(value: Decimal[]): void {
        this.editRowContainer.innerHTML="";
        this.factorEditViews.length=0;
        var degree=value.length-1;
        for (var c=degree;c>=0;c--)
        { 
           var v = new FactorEditView();
           v.setModel(value[degree-c]);
           v.degree=c;
           this.factorEditViews.push(v); 
           this.editRowContainer.appendChild(v.element[0]);          
        }
    }
    push(value:Decimal)
    {
        var v = new FactorEditView();
        v.setModel(value);
        v.degree=this.factorEditViews.length;
        this.factorEditViews.unshift(v); 
        this.editRowContainer.prepend(v.element[0]); 
    }
    pop(): void {
        if (this.factorEditViews.shift()===undefined) return;
        this.editRowContainer.firstElementChild.remove();        
    }
    getModel(): Decimal[] {
      return this.factorEditViews.map(p=>p.getModel());
    }

    dispose(): void {
        this.editRowContainer.onkeydown=null;
    }
    
}


export class FactorEditView extends View<Decimal>
{
    private static tmplXtext =<HTMLTemplateElement> document.getElementById("tmplXedit");
    private factor:HTMLInputElement;
    private _degree: number;
    public get degree(): number {
        return this._degree;
    }
    public set degree(value: number) {
        this._degree = value;
        if (this.degree!=0) 
        {
            this.element[0].querySelector(".variablename").innerHTML="x";
            var exponent=<HTMLElement> this.element[0].querySelector(".exponent");
            exponent.innerHTML=this.degree.toString();
            if (this.degree==1)  exponent.style.display="none";
            this.element[0].querySelector(".sign").innerHTML="+";
        }
        else
        {      
          this.element[0].querySelector(".sign").innerHTML="=0";
        }
    }
    constructor()
    {
        super(FactorEditView.tmplXtext);
        this.factor= <HTMLInputElement> this.element[0].querySelector(".factor") ;
    }
    
    setModel(value: Decimal): void {
        this.factor.value=value===null || value.isNaN() ?"":value.toString();
    }
    getModel(): Decimal {
        var decimal:Decimal;
        try{
         decimal= new Decimal(this.factor.value.trim());
        } catch(ex)
        {
          return new Decimal(0);
        }
        
        return decimal.isNaN() ? new Decimal(0):decimal;
    }

    dispose(): void {
      
    }
    
}





type Main={ solution:Solution[],polynomEdit: Array <Decimal> }
export class MainView extends View<Main>  {

    private btnAdd= <HTMLButtonElement> document.getElementById("btnAdd");
    private btnRemove= <HTMLButtonElement> document.getElementById("btnRemove");
    private btnSolve = <HTMLElement>document.getElementById("btnSolve");
    private btnPlot = <HTMLElement>document.getElementById("btnPlot");
    private btnDivide = <HTMLElement>document.getElementById("btnDivide");

    public polynomeditview:PolynomEditView;
    public solutionsview:SolutionsView;
    public get onbuttonadd(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
        return this.btnAdd.onclick;
    }
    public set onbuttonadd(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
        this.btnAdd.onclick = value;
    }

    public get onbuttonremove(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
        return this.btnRemove.onclick;
    }
    public set onbuttonremove(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
        this.btnRemove.onclick = value;
    }

    public get onbuttonsolve(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
        return this.btnSolve.onclick;
    }
    public set onbuttonsolve(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
        this.btnSolve.onclick = value;
    }
    public get onbuttonplot(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
        return this.btnPlot.onclick;
    }
    public set onbuttonplot(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
        this.btnPlot.onclick = value;
    }
    public get onbuttondivide(): (this: GlobalEventHandlers, ev: MouseEvent) => any {
        return this.btnDivide.onclick;
    }
    public set onbuttondivide(value: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
        this.btnDivide.onclick = value;
    }


    constructor() {   
      super(document.body);
      this.solutionsview= new SolutionsView();
      this.polynomeditview= new PolynomEditView();
      var topContainer= <HTMLElement> document.getElementById("topContainer");
      this.polynomeditview.appendTo(topContainer);     
    }
  
    setModel(value: Main): void {

        this.polynomeditview.setModel(value.polynomEdit);
        this.solutionsview.setModel(value.solution);
            
    }
    getModel(): Main {
        return {solution:this.solutionsview.getModel(),polynomEdit:this.polynomeditview.getModel()};
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }

  }