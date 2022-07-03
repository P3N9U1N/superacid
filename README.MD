# Superacid
Superacid is a new algorithm that finds roots of polynomials in O(n^2).
It is a variant of the Newton-Raphson method.
But instead of looking at random points on the curve, superacid seperates the curve
in intervals where the sign of the derivative is constant. As an additional requirement,
f'(x) may never be zero, because this could cause the Newton-Raphson method to fail,
because of the iteration forumla x=x-f(x)/f'(x).
The intervals are located from -infinity to the first stationary point, in between neigbouring
stationary points, and from the last stationary point to +infinity. 
Within an interval, there may exist at most 1 root, because if the function crosses the x-axis
within an interval, the sign of the derivate would have to change, in order for the function 
to cross the x-axis again. If f(left side of an interval) and f(right side of the same interval) 
have opposite signs, there is exactly one root. If they have the same sign,
there is no root within this interval. This root isolation technique enables performance
optimizations. The stationary points of a given polynomial that define the intervals and enable
solving the polynomial are located at the roots of the derivate. The roots of all 
derivatives are needed first, so superacid starts solving
the derivative of degree 1 and works its way up to the target polynomial, finding all roots.




# GUI
There is a GUI for testing:
https://p3n9u1n.github.io/superacid/gui/index.html

The usage should be straightforward. There is a JSXGraph based plotter included, with following controls:
* SHIFT+Drag mouse: move 
* SHIFT+Mouse Wheel: Control zoom
