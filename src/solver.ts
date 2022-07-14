import {Decimal} from 'decimal.js';
Decimal.set({ precision: 96})
export {Decimal};
const negativeInfinity =new Decimal(Number.NEGATIVE_INFINITY);
const positiveInfinity =new Decimal(Number.POSITIVE_INFINITY);
const zero =new Decimal(0);
const one =new Decimal(1);
const two =new Decimal(2);
const nan =new Decimal(Number.NaN);

export function* getIntervalsInPolynom( ...sortedDerivateZeros:Decimal[]):Generator<Interval>
{
    var left,right;
    var index=sortedDerivateZeros.length;  
    if (index ==0) {
       yield {left:negativeInfinity,right:positiveInfinity,start:zero};
       return;
    } 
    right=sortedDerivateZeros[0]
    yield  {left:negativeInfinity,right,start:right.sub(one)}; 

    for (var i=1;i<index;i++)
    {
        left=right;      
        right=sortedDerivateZeros[i];    
        if (left.greaterThanOrEqualTo(right)) throw new Error();        
        yield {left,right,start:left.add(right).div(two)};      
    }
    yield  {left:right,right:positiveInfinity,start:right.add(one)} ;    
}

export function superacid(polynom:Decimal[],accuracy:Decimal=new Decimal("0.00001"), iterations:number=96):Decimal[]
{
  var result= solve(polynom,accuracy,iterations);
  if (result.length==0) return [];
  return result[0].zeros;
}

export function newtonIterate(polynom:Decimal[],derivate:Decimal[],
    left:Decimal,right:Decimal,start:Decimal,
    iterations:number,accuracy:Decimal):Decimal
{
 var degree = polynom.length-1;
 if (degree<=0 || derivate.length != polynom.length-1) return null;
 if (iterations<0) return null;
 var c=0;
 var x=null;
 var fx=positiveInfinity;
 var fxx=null;
 var nextFx=null;
 while(true)
 {    
    if (start.lessThan(left) || start.greaterThan(right)) 
    {
        break;
    }    
    nextFx=calculate(polynom,start);
    if (c>1 && nextFx.abs().greaterThanOrEqualTo(fx.abs()) && fx.abs().lessThan(accuracy)) 
    {      
      return x;
    }   
    fx= nextFx;
    x=start; 
    if (fx.isZero() || 
       c>=iterations ||
       (fxx= calculate(derivate,x)).isZero()) break;
    var start=start.sub(fx.div(fxx));
    c++;    
 }
 return fx.abs().lessThan(accuracy) ? x: null;
}

export function bisect(polynom:Decimal[],
  positiveEndpoint:Decimal,negativeEndpoint:Decimal,
  iterations:number,accuracy:Decimal):Decimal
{
  var degree = polynom.length-1;
  if (degree<=0) return null;
  //var fxPositive=calculate(polynom,positiveEndpoint);
  //var fxNegative=calculate(polynom,negativeEndpoint);
  var oldmiddle=positiveInfinity;
  for (var c=0;c< iterations;c++)
  {
    var middle=positiveEndpoint.add(negativeEndpoint).div(two);
    if (middle.equals(oldmiddle))
    {
       break;
    }

    var fxmiddle=calculate(polynom,middle);
    if (fxmiddle.abs().lessThan(accuracy)) return middle;
    if (fxmiddle.isPositive())
    {
     positiveEndpoint=middle;
    } else
    {
     negativeEndpoint=middle;
    }
    oldmiddle=middle;
  }
  return fxmiddle.abs().lessThan(accuracy)? middle:null;
}

export function calculateDerivates(polynom:Decimal[])
{
    var derivatesCount = polynom.length-1;
    if (derivatesCount<1) return [];
    var derivations=new Array<Decimal[]>(derivatesCount);
    derivations[0]= derivative(polynom);
    for (var c=1;c<derivatesCount;c++)
    {     
        derivations[c]=derivative(derivations[c-1]);
    } 
    return derivations;
}
export function derivative(polynom:Decimal[])
{
    var c=polynom.length-1;
    var derivative= new Array<Decimal>(c); 
    var degree=1;  
    while (c--)
    {      
        derivative[c]=(polynom[c].mul(degree));
        degree++;
    }
    return derivative;
}
export function calculate(polynom:Decimal[],x:Decimal)
{
    var sum=zero;
    var c=polynom.length;
    var degree=0;  
    while (c--)
    {      
        sum=sum.add(polynom[c].mul(Decimal.pow(x,degree)));
        degree++;
    }
    return sum;
}

export function mergeNeighbouringRoots(roots: Decimal[],accuracy:Decimal)
{
 var length=roots.length;
 var count=0;
 for (var c=0;c<length;)
 {   
     var sum=zero;   
     var startMerge=c;  
     do 
     {
       var value=roots[c];
       sum= sum.add(value);
       c++;
     } while ((c<length)&&value.sub(roots[c]).abs().lessThan(accuracy))
     roots[count]=sum.div(c-startMerge);
     count++;
 }
 roots.length=count;
}

export function isFunctionAscendingToTheRight(polynoms:Decimal[][], x:Decimal,accuracy:Decimal=new Decimal(0.001)):boolean
{ 
 //find first non-zero derivation
 for (var f =1;f<polynoms.length;f++ )
 {
   var value=calculate(polynoms[f],x);
   if (!value.abs().lessThan(accuracy)) {
     return value.isPositive();
   }
 }
 return null;
}
export function isFunctionAscendingToTheLeft(polynoms:Decimal[][], x:Decimal,accuracy:Decimal=new Decimal(0.001)):boolean
{ 
 //find first non-zero derivation
 for (var f =1;f<polynoms.length;f++ )
 {
   var value=calculate(polynoms[f],x);
   if (!value.abs().lessThan(accuracy)) {
     return value.isPositive()==(f % 2 ==0);
   }
 }
 return null;
}

export function multiplicate(polynom1:Decimal[],polynom2:Decimal[])
{
  var arraySize=polynom1.length-1+polynom2.length;
  var p = new Array<Decimal>(arraySize).fill(zero); 
  for (var p1=0;p1<polynom1.length;p1++)
  {
    for (var p2=0;p2<polynom2.length;p2++)
    {
        var targetDegree=p1+p2;
        var sum2add=polynom1[p1].mul(polynom2[p2]);
        p[targetDegree]=p[targetDegree].add(sum2add);
    }
  }
  return p;
}

export function generatePolynomFromRoots(...roots:Decimal[])
{
  var p:Decimal[]=[one];
  for (var c=0;c< roots.length;c++)
  {
    p=multiplicate(p,[one, roots[c].neg()]);   
  }
  return p;
}

export function simplyfyPolynom(polynom:Decimal[]):Decimal[]
{ 
 var p:Decimal[]=[];
 var first:Decimal=null;
 var length=polynom.length;
 for (var c=0;c<length;c++)
 {
  var value=polynom[c];
  if (!value.isZero())
  {
      first=value;     
      break;
  }
 }
 for (;c<length;c++)
 {
  var value=polynom[c];
  p.push(value.div(first));
 }
 return p;
}
export function antiderivative(polynom:Decimal[])
{
    var degree=polynom.length;
    var ad= new Array<Decimal>(degree+1);  
    var lastIndex=degree;   
    for (var c=0;c<lastIndex;c++)
    {
      ad[c]=polynom[c].div(degree);
      degree--;
    }
    ad[lastIndex]=zero;
    return ad;
}
type Interval=
{
    left:Decimal;
    right:Decimal;
    start:Decimal
}

export function $(...arr:Decimal.Value[])
{
    return arr.map(p=>{return new Decimal(p);});
}

export function toString(polynom:Decimal[],decimalPlaces:0|1|2|3|4|5|6|7|8|9)
{
    var factor=Decimal.pow(10,decimalPlaces);
    var degree=polynom.length;
    var c=0;
    var result="";
    var f=0;
    while(degree--)
    {     
     var value=polynom[c];
     if (!value.isZero())
     {
        if (value.isPositive())
        { 
           if (f) result+= "+";
        } else
        {
           result+= "-";
        }
        var abs= value.abs();
        var showFactor=degree==0 || !abs.equals(one);
        if (showFactor) result+=abs.mul(factor).round().div(factor).toString()
        
        if (degree !=0)
        {
           result+=(showFactor?"*":"") +"x";
        } 
        if (degree >1)
        {
            result+="^"+degree;
        }
        f++;
     } 
     c++;
    }    
    return result;
}

type RootFindingResult={polynom:Decimal[],zeros:Decimal[]} 
export function solve(polynom:Decimal[],accuracy:Decimal=new Decimal(0.001), iterations:number=64):RootFindingResult[]
{
 /*
  Simplify polynomial by dividing through the first coefficient.
  Smaller coefficients mean less chance of overflowing.
 */
  polynom=simplyfyPolynom(polynom); 
  var degree = polynom.length-1;
  if (degree<=0) return null;
  var polynoms=calculateDerivates(polynom); //calculate all derivatives
  /*
    Add polynomial to the list of polynomials, whose roots need to be calculated
  */
  polynoms.unshift(polynom); 
  var c= degree;
  var firstDegreeDerivation=polynoms[polynoms.length-2];
  var derivateZeros:Decimal[]=[firstDegreeDerivation[1].neg().div(firstDegreeDerivation[0])];
  var results:RootFindingResult[]=[];
  results.unshift({polynom:firstDegreeDerivation,zeros:derivateZeros})
  /*
   Calculate roots of polynomial and all its derivates, starting with lowest degree.
   Roots are needed for calculating the roots of the polynom with the next degree.  
  */
  while (--c) 
  { 
     var fx= polynoms[c-1];
     var fxx= polynoms[c];
     var roots:Decimal[]=[];  
     /*
       Intervals are located from -infinity to the first stationary point, in between neigbouring
       stationary points, and from the last stationary point to +infinity. Because of that, the zeros
       of the derivate are needed, calculated in the last loop iteration.
       In each interval there is at most one zero, because the sign of the derivative is constant.
     */  
     var intervals= getIntervalsInPolynom(...derivateZeros); 
     for( var interval of intervals)
     { 
        var root=null;
        var fxLeft=null,fxRight=null;
       
        var leftestInterval= interval.left.equals(negativeInfinity);
        var rightestInterval = interval.right.equals(positiveInfinity);
        if (leftestInterval || 
           rightestInterval)
        {
         //Choose Newton method
         root=newtonIterate(fx,fxx,interval.left,interval.right,interval.start,iterations,accuracy); 
        } else
        {
           fxLeft= fxRight ?? calculate(fx,interval.left);
           fxRight=calculate(fx,interval.right);
           if (fxLeft.abs().lessThan(accuracy) ||
               fxRight.abs().lessThan(accuracy))
           {
             //Choose Newton method
             root=newtonIterate(fx,fxx,interval.left,interval.right,interval.start,iterations,accuracy); 
           } else
           {
             //Choose bisecting
             var fxLeftPositive=fxLeft.isPositive();
             if(fxLeftPositive!=fxRight.isPositive())
             {
               var positiveEndpoint,negativeEndpoint;
               if (fxLeftPositive)
               {
                 positiveEndpoint=interval.left;
                 negativeEndpoint=interval.right;
               } else
               {
                 positiveEndpoint=interval.right;
                 negativeEndpoint=interval.left;
               }
               root=bisect(fx,positiveEndpoint,negativeEndpoint,iterations,accuracy);
             }
           }                
        }      
        if (root==null) continue;   
        //skip next interval, because root will be the same as in the current interval  
        if (interval.right.minus(root).abs().lessThan(accuracy)) intervals.next(); 
        roots.push(root); //Add root to the list of found roots   
     }
     results.unshift({polynom:fx,zeros:roots})
     derivateZeros=roots;    
  }
  return results; // return found roots
}

//experimental root isolation (is not used)
export function* isolateRoots(polynoms:Decimal[][],sortedDerivateZeros:Decimal[],accuracy:Decimal = new Decimal(0.001)):Generator<Interval>
{
    var left,right;
    var polynom=polynoms[0];
    var index=sortedDerivateZeros.length;  
    if (index ==0) {    
       yield {left:negativeInfinity,right:positiveInfinity,start:zero};
       return;
    } 
    right=sortedDerivateZeros[0]
    var fxRight= calculate(polynom,right);
    if (fxRight.abs().lessThan(accuracy) || (fxRight.isNegative() == isFunctionAscendingToTheLeft(polynoms,right,accuracy)))
    {  
        yield  {left:negativeInfinity,right,start:right.sub(one)};
    }  

    for (var i=1;i<index;i++)
    {
        left=right;      
        right=sortedDerivateZeros[i];    
        if (left.greaterThanOrEqualTo(right)) throw new Error();   
        var fxLeft=fxRight;
        var fxRight=calculate(polynom,right);
        if (fxRight.abs().lessThan(accuracy) || fxLeft.abs().lessThan(accuracy) || fxLeft.isPositive()!=fxRight.isPositive())
        {             
            yield {left,right,start:left.add(right).div(two)}; 
        }  
    }
    
    if (fxRight.abs().lessThan(accuracy) || (fxRight.isNegative() == isFunctionAscendingToTheRight(polynoms,right,accuracy)))
    {      
      yield  {left:right,right:positiveInfinity,start:right.add(one)}; 
    }
}