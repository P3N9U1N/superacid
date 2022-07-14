import * as solver from "../src/solver"
import { Decimal,$ } from "../src/solver";
function* generateTestData<T>(values:T[],maxlen:number,minlen:number=maxlen)
{ 
    var result:T[]=[];
    var stack:Array<number> =[];
    stack.push(-1); 
    while(stack.length>0)
    {
        var lastIndex= stack.length-1;
        result[lastIndex]=values[++stack[lastIndex]];
        if (stack[lastIndex]==values.length)
        {       
            stack.pop();
            result.pop();
        } else
        {   
            if (stack.length >= minlen) yield [...result];    
            if (stack.length<maxlen) 
            {
                stack.push(-1);               
            } 
        }    
    }
}

function* generateUniqueTestData<T>(values:T[],maxlen:number,minlen:number=maxlen)
{ 
    var result:T[]=[];
    var stack:Array<number> =[];
    stack.push(-1);   
    while(stack.length>0)
    {
        var lastIndex= stack.length-1;
        result[lastIndex]=values[++stack[lastIndex]];
        if ((lastIndex!=0 && stack[lastIndex]>=stack[lastIndex-1]) || stack[lastIndex]==values.length)
        {       
            stack.pop();
            result.pop();
        } else
        {   
            if (stack.length >= minlen) yield [...result];    
            if (stack.length<maxlen) 
            {
                stack.push(-1);               
            } 
        }    
    }
}

function sortArray(arr:Decimal[])
{    
    return arr.sort((a,b)=>
        { 
        if (a.equals(b)) return 0;
        if (a.greaterThan(b)) return 1;
        return -1
        }
    );    
}
function toBeCloseTo(a:Decimal.Value,b:Decimal.Value)
{
    a= new Decimal(a);
    b= new Decimal(b);
    expect(a.minus(b).abs().lessThan(new Decimal(0.01))).toBeTruthy();
}
function toBeClose(a:Decimal[] ,b:Decimal[])
{
    expect(a.length).toBe(b.length);
    for (var c =0;c<a.length;c++)
    {
       toBeCloseTo(a[c],b[c]);
    }
}

test("derivative", () => { 
 expect(solver.derivative($(2,5,1))).toEqual($(4,5))
 expect(solver.derivative($(10,17,5,0))).toEqual($(30,34,5))
});

test("calculate", () => { 
     toBeCloseTo(solver.calculate($(2,5,1), new Decimal(4)),53);  
   });

test("calc all derivates", () => { 
    var actual=solver.calculateDerivates($(20,12,10,12,1))
    var expected:Decimal[][]=
    [$(80,36,20,12),
    $(240,72,20),
    $(480,72),
    $(480)   
    ]
    expect(actual).toEqual(expected);  

   });


test("multiplicate easy", () => { 
    var a= $(1,-5,-12,36);
    var b= $(2);
    var actual=solver.multiplicate(a,b);
    var expected=$(2,-10,-24,72);
    expect(actual).toEqual(expected);
   });
test("multiplicate medium", () => { 
    var a= $(2,-5,-12);
    var b= $(3,4,7);
    var actual=solver.multiplicate(a,b);
    var expected=$(6,-7,-42,-83,-84);
    expect(actual).toEqual(expected); 
   });

test("solve first degree", () => { 
    var a= $(2,12); 
    var actual= solver.superacid(a)
    var expected=$(-6);
    toBeClose(actual,expected);
});
test("solve second degree", () => { 
    var a= $(2,12,5); 
    var actual= solver.superacid(a);
    var expected=$(-5.55,-0.45);
    toBeClose(actual,expected);
});

test("solve third degree", () => { 
    var a= $(1,-7,-14,48); 
    var actual= solver.superacid(a);
    var expected=$(-3,2,8); 
    toBeClose(actual,expected);
});
test("solve third degree 2 solution", () => { 
    var a= $(1,0,-12,16); 
    var actual= solver.superacid(a);
    var expected=$(-4,2); 
    toBeClose(actual,expected);
});
test("solve third degree 1 solutions", () => { 
    var a= $(1,9,27,27); 
    var actual= solver.superacid(a)
    var expected=$(-3); 
    toBeClose(actual,expected);
});

test("no solutions", () => { 
    var a= $(2,0,2); 
    var actual= solver.superacid(a)
    expect(actual.length).toBe(0);

    var a= $(-2,-2,1,-4,-6); 
    var actual= solver.superacid(a)
    expect(actual.length).toBe(0);
    
});

test("generate polynom from roots", () => {   
 var polynom =solver.generatePolynomFromRoots(...$(2,3,4));
 var actual=sortArray(solver.superacid(polynom));
 toBeCloseTo(actual[0], 2);
 toBeCloseTo(actual[1],3);
 toBeCloseTo(actual[2],4);
});


test("antiderivative", () => { 
   
   var actual= solver.antiderivative($(24,6,1))
   var expected=$(8,3,1,0);
   expect(actual).toEqual(expected);
});

test("test generator", () => {    
 expect(Array.from(generateTestData([1,2,3],4)).length).toBe(3*3*3*3);
 expect(Array.from(generateTestData([1,2,3],4,3)).length).toBe(3*3*3*3+3*3*3);
 });
 
 test("simplify polynom", () => {    
    expect(solver.simplyfyPolynom($(2,4,8))).toEqual($(1,2,4));
    expect(solver.simplyfyPolynom($(0,2,4,8))).toEqual($(1,2,4));
    });

test("merge neighbouring roots", () => {    
    var actual= $(1,2,3);
    
    solver.mergeNeighbouringRoots(actual, new Decimal(0.5))
    expect(actual).toEqual($(1,2,3));  
    actual= $(1,2,3);
    solver.mergeNeighbouringRoots(actual,new Decimal(2))
    expect(actual).toEqual($(2));
    actual= $(1,5,6,7,8,9,15);
    solver.mergeNeighbouringRoots(actual,new Decimal(3))
    expect(actual).toEqual($(1,7,15));
    actual= $(1,2,3,7,8,9);
    solver.mergeNeighbouringRoots(actual,new Decimal(3))
    expect(actual).toEqual($(2,8));
    actual= $(1,5,6,7);
    solver.mergeNeighbouringRoots(actual,new Decimal(2))
    expect(actual).toEqual($(1,6));
    actual= $(-2,-2);
    solver.mergeNeighbouringRoots(actual,new Decimal(1))
    expect(actual).toEqual($(-2));
});


test("third degree batch test", () => { 
    var a= [-2,9,5,-3,10,-9,-1,1]; 
    for (var p of  generateUniqueTestData(a,3))
    {
      testSolver(p);
    }

});
test("fourth degree batch test", () => { 
    var a= [-2,9,5,-3,10,-9,-1,1,10,-10,7,8]; 
    for (var p of  generateUniqueTestData(a,4))
    {
      testSolver(p);
    }

});
test("fifth degree batch test", () => { 
    var a= [-2,9,5,-3,10,-9,20,1,-1]; 
    for (var p of  generateUniqueTestData(a,5))
    {
      testSolver(p);
    }
});

test("sixth degree batch test", () => { 
    var a= [-2,9,5,-3,10,-9,20,1,-1,4,5,-6]; 
    for (var p of  generateUniqueTestData(a,6))
    {
      testSolver(p);
    }
});
test("seventh degree batch test", () => { 
    var a= [-2,9,5,-3,10,-9,20,1,-1,4,5,-6]; 
    for (var p of  generateUniqueTestData(a,7))
    {  
      testSolver(p);
    }
});
test("8th degree batch test", () => { 
    var a= [-2,9,5,-3,0,-9,20,1,-1,4,5,-6]; 
    for (var p of  generateUniqueTestData(a,8))
    {  
      testSolver(p);
    }
});
function testSolver(zeros:number[],accuracy:Decimal=new Decimal(0.01),iterations:number=50,log:boolean=true)
{
    var p=solver.generatePolynomFromRoots(...$(...zeros));
    var result=solver.superacid(p,accuracy,iterations);
    var actual=sortArray(result);
    var expected = sortArray($(...Array.from(new Set(zeros))));
    try
    {
      toBeClose(actual,expected);
    } catch(ex)
    {
        if (log) console.log("Zeros:"+zeros+ " | "+"Actual: "+ actual+      " | " + "Polynom: "+ p );
        throw ex;
    }
}

test("big numbers test", () => { 
    var a= [-20,90,50,-30,0,-85,20,35,-10,300,500,-60]; 
   
    for (var p of  generateUniqueTestData(a,3))
    {  
      testSolver(p);
    }


    for (var p of  generateUniqueTestData(a,4))
    {  
      testSolver(p);
    }
   
    for (var p of  generateUniqueTestData(a,5))
    {  
      testSolver(p,new Decimal(0.1),2000);
    }

});
test("big numbers 3th degree", () => { 
    var a= [-2000,9000,5000,-300,0,-8500,12200,350,-100,3000,5000,-600,10000,-20000,-14000,30000,-40000]; 
   
    for (var p of  generateUniqueTestData(a,3))
    {  
      testSolver(p,new Decimal(0.001),70);
    }

});
test("medium numbers 4th degree", () => { 
    var a= [-200,900,500,-30,0,-850,1220,35,-10,300,500,-60,1000,-200,-140,300,-400]; 
   
    for (var p of  generateUniqueTestData(a,4))
    {  
      testSolver(p,new Decimal(1),70);
    }

});
test("big numbers 4th degree", () => { 
    var a= [-2000,9000,5000,-300,0,-8500,12200,350,-100,3000,5000,-600,10000,-2000,-1400,3000,-4000]; 
   
    for (var p of  generateUniqueTestData(a,4))
    {  
      testSolver(p,new Decimal(1),70);
    }

});

test("big numbers shared roots 4th degree", () => { 
    var a= [2000,2000,5000,5000,0,0,-8500,-8500,12200,12200,3000,5000,-600,-600,12200,-2000,-1400,3000,-4000,-10000,-10000,-10000,-10000]; 
   
    for (var p of  generateUniqueTestData(a,4))
    {  
      testSolver(p,new Decimal(1),70);
    }

});

test("big numbers shared roots 5th degree", () => { 
    var a= [2000,2000,2000,2000,15000,15000,0,0,0,0, -10000,-10000,-10000,-10000]; 
   
    for (var p of  generateUniqueTestData(a,5))
    {  
      testSolver(p, new Decimal("0.000000001"),120 );
    }

});

test("close zero test", () => { 
    var polynom= solver.$(1,0,"0.000001"); 

    var actual=solver.superacid(polynom,new Decimal("0.000001"),128)
    expect(actual.length).toBe(0);
});

test("shared roots test", () => { 
    var a= [2,2,500,-300,0,-3,-3,0,-100,30,50,-60,0,-3,3]; 
    var accuracy = new Decimal("0.000000001");
    for (var p of  generateUniqueTestData(a,4))
    {  
      testSolver(p, accuracy,100,true);
    }
    testSolver([0,0],accuracy,100);
    testSolver([0,0,0],accuracy,100);
    testSolver([2,2,2],accuracy,100);
    testSolver([-5,-5,-5],accuracy,100);
    testSolver([-5,-5,-7],accuracy,100);
 
});

test("single test", () => { 
 testSolver([10,5,9,-2],new Decimal(0.01),96);


});

test("unique test data", () => { 
 var f= Array.from(generateUniqueTestData([1,2,3],2));
 expect(Array.from(generateUniqueTestData([1,2,3],2)).length).toBe(3);
 expect(Array.from(generateUniqueTestData([1,2,3],3)).length).toBe(1);
 expect(Array.from(generateUniqueTestData([1,2,3],1)).length).toBe(3); 

 var arr=Array.from(generateUniqueTestData([1,2,3,4,5,6,7,8,9,10],5));
 arr = arr.map(p=>p.sort((a,b)=>a-b));
 for (var x=0;x<arr.length;x++)
 {
    for (var y=x+1;y<arr.length;y++)
    {
      expect(arr[x]).not.toEqual(arr[y]);
    }
 }
});

test("Wilkinsons polynomial", () => { 
    var w =$(1);
    var expected=$();
    for (var c = 1;c<=20;c++)
    {
       expected.push(new Decimal(c));
       w= solver.multiplicate(w,$(1,-c));
    }
    var actual=sortArray(solver.superacid(w,new Decimal("0.00001"),256))
    // console.log(actual);
    toBeClose(actual,expected);
});

test("root test", () => { 
 
    var x =$(1,0,-3333);
    var actual= solver.superacid(x,new Decimal(1),70)
    var expected= Math.sqrt(3333);
    toBeClose(actual,$(-expected,expected));
});

test("cube root test", () => {  
    var x =$(1,0,0,-3333);
    var actual= solver.superacid(x,new Decimal(1),70)
   
    var expected= Math.pow(3333,1/3);
    toBeClose(actual,$(expected));    

});

test("negative cube root test", () => {  
    var x =$(1,0,0,3333);
    var actual= solver.superacid(x,new Decimal(1),70)   
    var expected= -Math.pow(3333,1/3);
    toBeClose(actual,$(expected));
});

test("accuracy test1", () => { 
    var a= [-2000,9000,5000,-300,0,-8500,12200,350,-100,3000,5000,-600,10000,-2000,-1400,3000,-4000]; 
    var success=0;
    var fail=0;
    for (var p of  generateUniqueTestData(a,4))
    {  
     try {
         
        testSolver(p,new Decimal("0.000000001"),100,false);
        success++;
     } catch (error) {
         fail++;
     }

    }   
    expect(success).toBe(success+fail); 
});
test("accuracyTest 2", () => { 
    var a= [-2000,9000,5000,-300,0,-8500,12200,350,-100,3000,5000,-600,10000,-2000,-1400,3000,-4000]; 
    var success=0;
    var fail=0;
    for (var p of  generateUniqueTestData(a,5))
    {  
     try {
         
        testSolver(p,new Decimal("0.000000001"),100,false);
        success++;
     } catch (error) {
         fail++;
     }

    }
    expect(success).toBe(success+fail); 
});


test("solve first degree", () => { 
   var p= solver.$(4,8);
   var actual= solver.solve(p);
   expect(actual.length).toBe(1);
   expect(actual[0].zeros).toEqual($(-2));
   expect(actual[0].polynom).toEqual($(1,2));
    
});
test("solve second degree", () => { 
    var p= solver.$(1,4,-5);
    var actual= solver.solve(p);
    expect(actual.length).toBe(2);
    expect(actual[0].zeros).toEqual($(-5,1));
    expect(actual[0].polynom).toEqual($(1,4,-5));
    expect(actual[1].zeros).toEqual($(-2));
    expect(actual[1].polynom).toEqual($(2,4));
 });

 test("solve difficult polynom", () => { 
  // -1*x^8 + 8*x^6 - (73/4)*x^4 + 18*x^2 - (3/4)
  var actual=solver.superacid($(-1,0,8,0,-18.25,0,18 ,0,-0.75))
  var expected= $(-2.261, -0.209, 0.209, 2.261);
  toBeClose(actual,expected);
 });



 test("toString", () => { 
     
    var p= solver.toString(solver.$(1,4,-5),0);
    expect(p).toBe("x^2+4*x-5");
    var p= solver.toString(solver.$(1,4,5),0);
    expect(p).toBe("x^2+4*x+5");
    var p= solver.toString(solver.$(2,-4,5),0);
    expect(p).toBe("2*x^2-4*x+5");
    var p= solver.toString(solver.$(3,-1,1),0);
    expect(p).toBe("3*x^2-x+1");
    var p= solver.toString(solver.$(-3,-2,-1),0);
    expect(p).toBe("-3*x^2-2*x-1");
    var p= solver.toString(solver.$(0,-2,-1),0);
    expect(p).toBe("-2*x-1");
    var p= solver.toString(solver.$(1,0,-1),0);
    expect(p).toBe("x^2-1");
    var p= solver.toString(solver.$(1,0,2),0);
    expect(p).toBe("x^2+2");
    var p= solver.toString(solver.$(1,0,0),0);
    expect(p).toBe("x^2");
    var p= solver.toString(solver.$(2,3,0),0);
    expect(p).toBe("2*x^2+3*x");
    var p= solver.toString(solver.$(0,3,0),0);
    expect(p).toBe("3*x");
    var p= solver.toString(solver.$(0,0,-1),0);
    expect(p).toBe("-1");
    var p= solver.toString(solver.$(0,0,1),0);
    expect(p).toBe("1");
    var p= solver.toString(solver.$(0,0,-2),0);
    expect(p).toBe("-2");
    var p= solver.toString(solver.$(0,0,2),0);
    expect(p).toBe("2");
    var p= solver.toString(solver.$(0,0,0,1,0),0);
    expect(p).toBe("x");
    var p= solver.toString(solver.$(0,0,0,-1,0),0);
    expect(p).toBe("-x");
    var p= solver.toString(solver.$(0,0,0,2,0),0);
    expect(p).toBe("2*x");
    var p= solver.toString(solver.$(0,0,0,-2,3),0);
    expect(p).toBe("-2*x+3");
    var p= solver.toString(solver.$(0,0,-2,1,0),0);
    expect(p).toBe("-2*x^2+x");
 });


 test("isFunctionAscending right", () => { 
   var f=solver.$(2,0,0)
   var polynoms= solver.calculateDerivates(f);
   polynoms.unshift(f);
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(2))).toBeTruthy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(0))).toBeTruthy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(-1))).toBeFalsy();

   var f=solver.$(-1,2,-1,-2)
   var polynoms= solver.calculateDerivates(f);
   polynoms.unshift(f);
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(-3))).toBeFalsy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(0))).toBeFalsy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(1))).toBeFalsy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(0.5))).toBeTruthy();

   var f=solver.$(4,0,0,4)
   var polynoms= solver.calculateDerivates(f);
   polynoms.unshift(f);
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(0))).toBeTruthy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(1))).toBeTruthy();
   expect(solver.isFunctionAscendingToTheRight(polynoms,new Decimal(-1))).toBeTruthy();

 });

 test("isFunctionAscending left", () => { 
    var f=solver.$(2,0,0)
    var polynoms= solver.calculateDerivates(f);
    polynoms.unshift(f);
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(2))).toBeFalsy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(0))).toBeTruthy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(-1))).toBeTruthy();
 
    var f=solver.$(-1,2,-1,-2)
    var polynoms= solver.calculateDerivates(f);
    polynoms.unshift(f);
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(-3))).toBeTruthy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(0))).toBeTruthy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(1))).toBeFalsy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(0.5))).toBeFalsy();
 
 
    var f=solver.$(4,0,0,4)
    var polynoms= solver.calculateDerivates(f);
    polynoms.unshift(f);
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(0))).toBeFalsy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(1))).toBeFalsy();
    expect(solver.isFunctionAscendingToTheLeft(polynoms,new Decimal(-1))).toBeFalsy();
;

  });


 test("isolate Roots", () => { 
    
    var p=solver.$(1,0,0,-27);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,[new Decimal(0)]));
    expect(intervals.length).toEqual(1);
    expect(intervals[0].left).toEqual(new Decimal(0)); 
    expect(intervals[0].right).toEqual(new Decimal(Number.POSITIVE_INFINITY)); 


    var p=solver.$(2,0,-4,3);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(1);
    expect(intervals[0].left).toEqual(new Decimal(Number.NEGATIVE_INFINITY)); 


    var p=solver.$(1,-4,-21,100,-101);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(2);
    expect(intervals[0].left).toEqual(new Decimal(Number.NEGATIVE_INFINITY)); 
    expect(intervals[1].right).toEqual(new Decimal(Number.POSITIVE_INFINITY)); 

    var p=solver.$(1,-4,-21,100,-100);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(4);


    var p=solver.$(1,-4,-21,100,-100);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(4);


    var p=solver.$(-2,-2,1,-4,-21);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(0);

    var p=solver.$(2,0,2);   
    var polynoms=solver.calculateDerivates(p);
    polynoms.unshift(p);
    var intervals= Array.from(solver.isolateRoots(polynoms,solver.solve(p)[1].zeros));
    expect(intervals.length).toEqual(0);

 
  });

  test("bisect", () => { 
    
    var p= $(-2,1,3);
    var actual=solver.bisect(p,new Decimal(0), new Decimal(-3),500, new Decimal("0.001"));
    toBeCloseTo(actual, new Decimal(-1));

    var actual=solver.bisect(p,new Decimal(1), new Decimal(3),500, new Decimal("0.001"));
    toBeCloseTo(actual, new Decimal(1.5));
 
  });