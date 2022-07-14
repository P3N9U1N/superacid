# Superacid
An algorithm that finds nearing values for roots of polynomials.
It uses root isolation based on stationary points. The function is seperated into intervals from -infinity, to the first stationary point, in between neigbouring stationary points, and from the last stationary point to +infinity. Within each interval, the sign of the derivate is constant
because it is never zero. There may exist at most 1 root in each interval,
because If the function crosses the x-axis within an interval, the sign of the derivate would have to change, in order for the function 
to cross the x-axis again. If f(interval start) and f(interval end) have different signs, there is exactly one root, otherwise there is none.
The stationary points of a given polynomial that define the intervals and enable
solving the polynomial are located at the roots of the derivate. The roots of all 
derivatives are needed first, so the algorithm starts solving
the derivative of degree 1 and works its way up to the target polynomial, finding roots by applying the Newton method or bisecting to the intervals.

# What can it do?
* Find most or all roots within reasonable input values (experimental)
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
