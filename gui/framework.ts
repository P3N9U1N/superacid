

export abstract class ViewList<M,V extends View<M>> 
{
  private set= new Set<View<M>>();
  protected container:HTMLElement;
  protected element:HTMLElement;
 
  public onchange:(sender:ViewList<M,V>,view:View<M>,value:M )=>void=null;
  public onpropertychange:<X extends keyof M> (sender:ViewList<M,V>, view:View<M>, property:X  ,value:M[X])=>void=null;
  public onadd:(sender:ViewList<M,V>,view:View<M>,value:M )=>void=null;
  public onremove:(sender:ViewList<M,V>,view:View<M>)=>void=null;

  constructor(htmlElement:HTMLElement, containerSelector?:string ,iterable?:Iterable<M>)
  constructor(template:HTMLTemplateElement, containerSelector?:string ,iterable?:Iterable<M>)
  constructor(htmlElement:HTMLElement, containerSelector?:string ,iterable?:Iterable<M>)
  {
    if (htmlElement.tagName=="TEMPLATE")
    {
        this.element= <HTMLElement> (<HTMLTemplateElement> htmlElement).content.cloneNode(true);         
    } else
    {
        this.element=htmlElement;
    }
    this.container=containerSelector? this.element.querySelector(containerSelector):this.element;
    if (iterable)
    {
      for (var c of iterable)
      {
        this.add(c);
      }
    }
  }
  appendTo(target:HTMLElement)
  {
    target.appendChild(this.element);
  }
  indexOf(view: View<M>)
  {
    var index=0;
    for (var c of this)
    {
      if (c===view) return index;
      index++;
    }
    return -1;
  }
  

  add(value: M): V {   
    var view= this.createViewmodel(value);
    view.appendTo(this.container)
  
    this.set.add(view);
    view.onchange=(sender: View<M>, value: M)=>
    {
      if (this.onchange!=null) this.onchange(this,sender,value);
    }
    view.onpropertychange=(sender, property, value)=>
    {
      if (this.onpropertychange!=null) this.onpropertychange(this,sender, property, value);
    }
    if (this.onadd!=null) this.onadd(this,view,value);
    return view;
  }
  clear(): void {
    for (var c of this.set.keys())
    {
      c.remove();
      c.dispose(); 
    }
    this.set.clear();
  }
  delete(view: View<M>): boolean {
    if (!this.set.delete(view)) return false;
    if (this.onremove!=null) this.onremove(this,view);
    view.remove();
    view.dispose(); 
    return true;
  }

  has(value: View<M>): boolean {
    return this.set.has(value);   
  } 
 
  public get size() : number {
    return this.set.size;
  }
  *[Symbol.iterator](): IterableIterator<View<M>> {
    for (var i of this.set)
    {
       yield  i;
    }
  }
  
  public setModel(values:Array<M>):void
  {
    this.clear();  
    for (var m of values)
    {
     this.add(m);
    }   
  } 
  public getModel():Array<M>
  {
   var arr:M[] =[];
   for (var m of this)
   {
    arr.push(m.getModel());
   }
   return arr;
  } 
  
  public set visible(value: boolean) {
    var visibility= value?"visible":"hidden";
    this.element.style.visibility= visibility;
  }

  public set display(value: string | undefined) { 
    this.element.style.display= value;       
  }

  abstract createViewmodel(model:M):V; 
  abstract dispose():void;
}



export abstract class View<M>
{
    protected _element: HTMLElement[]=[];
    public get element(): ReadonlyArray<HTMLElement> {
      return this._element;
    }
    public onchange:(sender:View<M>,value:M )=>void=null;
    public onpropertychange:<X extends keyof M> (sender:View<M>, property:X  ,value:M[X])=>void=null;

    constructor(template:HTMLTemplateElement)    
    constructor(htmlElement:HTMLElement)
    constructor(htmlElements:HTMLElement[])    
    constructor(htmlElement:any)      
    {
        if (Array.isArray(htmlElement))
        {
          var arr = <HTMLElement[]> htmlElement;
          for (var e of arr)
          {
            this._element.push(e);
          }
        } else
        if (htmlElement.tagName=="TEMPLATE")
        {
            this._element= [<HTMLElement> (<HTMLTemplateElement> htmlElement).content.firstElementChild.cloneNode(true)];         
        } else
        {
            this._element=[htmlElement];
        }      
       
    }
    remove()
    {     
      for (var e of this._element)
      {
        e.remove();
      }      
    }
    appendTo(target:HTMLElement)
    {     
     
      for (var e of this._element)
      {
        target.appendChild(e);
      }  
    }
    
  
    emitChange(value:M)
    {
     if (this.onchange!=null) this.onchange(this,value);
    }

    emitPropertyChange<X extends keyof M>(property:X,value:M[X] )
    {
      if (this.onpropertychange!=null) this.onpropertychange(this,property,value);
    }

    
    /** Method for writing model to HTML */
    abstract setModel(value:M):void;
    /** Method for reading model from HTML */
    abstract getModel():M;
    /**Overwrite this method for unregistering events */
    public dispose():void
    {
      this.onchange=null;
      this.onpropertychange=null;
    }    
   
    public set visible(value: boolean) {
      var visibility= value?"visible":"hidden";
      for (var e of this._element)
      {
      e.style.visibility= visibility;
      }  
  
    }

    public set display(value: string | undefined) {   
      for (var e of this._element)
      {
      e.style.display= value;
      }   
    }


}