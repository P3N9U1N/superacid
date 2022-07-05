# Superacid
An algorithm that finds nearing values for roots of polynomials.
It is based on the Newton-Raphson method.
But instead of looking at random points on the curve, it seperates the curve
in intervals where the sign of the derivative is constant. As an additional requirement,
f'(x) may never be zero, because this could cause the Newton-Raphson method to fail,
because of the iteration forumla x=x-f(x)/f'(x).
The intervals are located from -infinity to the first stationary point, in between neigbouring
stationary points, and from the last stationary point to +infinity. 
Within an interval, there may exist at most 1 root, because if the function crosses the x-axis
within an interval, the sign of the derivate would have to change, in order for the function 
to cross the x-axis again. The stationary points of a given polynomial that define the intervals and enable
solving the polynomial are located at the roots of the derivate. The roots of all 
derivatives are needed first, so the algorithm starts solving
the derivative of degree 1 and works its way up to the target polynomial, finding roots.

# What can it do?
* Find all roots within reasonable input values 
* Solve Wilkinson's Polynomial

# Problems
Like other methods for calculating nearing values of roots, there can be accuracy issues, like:
* Not finding a root
* Distinguishing very close roots
* Falsely finding roots where a turning point is very close to the x-axis

# GUI
There is a GUI for testing:
https://p3n9u1n.github.io/superacid/gui/index.html

The usage should be straightforward. There is a JSXGraph based plotter included, with following controls:
* SHIFT+Drag mouse: move 
* SHIFT+Mouse Wheel: Control zoom
