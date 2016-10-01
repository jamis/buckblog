---
date: 2016-09-24
layout: post
title: "Weekly Programming Challenge #9"
categories:
- projects
author: Jamis
comments: true
summary: Bezier curves
---

Years ago, I toyed with getting a master's degree in computer science, and while that little experiment didn't last long, I was able to take some fascinating classes. One of them was CS 557, "Computer Aided Geometric Design", taught by Professor Tom Sederberg. It introduced me to the wonderful world of _curves_--Bezier curves, B-splines, surfaces, and more. It was one of those classes that has stuck with me for a long time, though I rarely get the chance to use any of what I learned there.

For this week's challenge, we're going to dip our toes into that magnificent mathematical sea, and implement _quadratic Bezier curves_.

But first, let's recap week #8.

## Week #8 Recap

For the [8th weekly programming challenge](weblog.jamisbuck.org/2016/9/17/weekly-programming-challenge-8.html), we tackled a parser and interpreter for a simple arithmetic expression grammar. The normal mode was basic--a simple evaluator for arithmetic expressions--but hard mode added some fun (I hope!) extras, like variables, statements, and even functions!

1. **Lasse Ebert** went all-in this week, again in Elixir. His solution nailed every hard mode requirement, and even went above and beyond and added support for some non-numeric data types, like lists! Check it out, here: [https://github.com/lasseebert/jamis_challenge/tree/master/008_calc](https://github.com/lasseebert/jamis_challenge/tree/master/008_calc). He earned a grand total of **nine points**, and with his support for lists and recursion, easily qualified for "surprise me" mode. Awesome work!
2. **Klas Axell**'s solution is in Java, here: [https://github.com/axekla/WeeklyProgrammingChallenge-8](https://github.com/axekla/WeeklyProgrammingChallenge-8). He implemented normal mode, and earned **one point**.
3. **David Rice** submitted a solution in Ruby for normal mode, earning **one point** as well. You can see it here: [https://github.com/davidjrice/calculation-parser](https://github.com/davidjrice/calculation-parser).

My own solution was in Haskell, here: [https://github.com/jamis/weekly-challenges/tree/master/008-calculator](https://github.com/jamis/weekly-challenges/tree/master/008-calculator). I implemented normal mode, as well as variables, multi-expressions, and exponentiation, and earned **four points**.

Awesome work, everyone!


## Weekly Challenge #9

Now, I'm not going to lie. There can be (potentially) a lot of math behind Bezier curves, but the good news is that it isn't _hard_ math. At least, not for the basic stuff. The algorithms for rendering a Bezier curve are iterative, using only basic arithmatic.

For once, Wikipedia kind of lets us down, as it's [article on Bezier curves](https://en.wikipedia.org/wiki/Bézier_curve) is fairly dense and kind of intimidating. We're going to focus just on quadratic Bezier curves for normal mode, here, which simplifies things a bit, but let me see if I can explain the basics here in a way that clarifies rather than intimidates.

A _quadratic_ formula is (essentially) one in which the variable is squared, or raised to the second power. For example:

    at^2 + bt + c

That's a quadratic formula where `t` is the variable. The other letters (`a`, `b`, and `c`) are just constants, called the _coefficients_.

For our Bezier curves, the coefficients will be points on a canvas. Each quadratic curve is defined by three _control points_, corresponding to the `a`, `b`, and `c` in our quadratic formula. By moving those control points, you change the shape of the curve. (If you've ever played with a curve tool in a program like Photoshop, you'll know exactly what I mean.)

In other words, you give the formula three control points, and a value of `t` that is between 0 and 1, and the formula gives you a point on the line that corresponds to `t`. When `t` is 0, you get the first control point. When `t` is 1, you get the third control point. And when `t` is in between, you get a point on the curve somewhere between the beginning and the end, depending on the value of the second control point.

For a quadratic Bezier curve, the formula we want is this one:

    P(t) = a(1-t)^2 + 2b(1-t)t + ct^2

Where `a`, `b`, and `c` are the control points, and `P(t)` is the point corresponding to whatever value of `t` we give it.

To draw a Bezier curve, then, we just choose how many segements we want to break the curve into, plot that many points along the curve, and connect them with lines. For example, we start at `P(0)`, connect that with a line to `P(0.1)`, and then from there to `P(0.2)`, and so forth all the way to `P(1.0)`.

Does that make sense? If you'd like additional reading, I strongly recommend the text book that my CS 557 professor wrote, and which he has made available for free as a PDF, here: [Computer Aided Geometric Design](http://tom.cs.byu.edu/~557/text/cagd.pdf) (last updated Sep 2016). It begins with a relatively gentle introduction to mathematical graphics concepts (like vectors, matrices, and parametric, implicit, and explicit equations), and then moves into discussions of Bezier curves and splines. (It's a pretty fantastic text book, really.)

So, for normal mode...

## Normal Mode

Your program will need to accept, as input, three points. The program will then emit an image of the quadratic Bezier curve that corresponds to those three points.

That's it!

Feel free to reuse your graphics library from [challenge #4](https://medium.com/@jamis/weekly-programming-challenge-4-7fe42f28d5d4), if you want, although you can use whatever graphics library is handy. All you need is the ability to draw lines between points.

A normal mode submission will earn you one point.


## Hard Mode

Once you've got the basics working, there are some fun things we can do with some more advanced topics. Consider some of these, each worth an additional one point:

1. Implement **cubic Bezier curves**. Instead of three control points, these accept four, and the formula changes as well, becoming `P(t) = a(1-t)^3 + 3bt(1-t)^2 + 3c(1-t)t^2 + dt^3`.
2. **Rational Bezier curves**. These add adjustable weights to each control point, and can actually be used to represent conic sections like circles. (The concept isn't hard to understand, but most sources tend to wrap it all mathematics that may be unfamiliar to some. Consider it an opportunity to stretch your math muscles!)
3. Use **de Casteljau's algorithm** to split a curve at an arbitrary value of `t`. Again, the [Wikipedia article](https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm) is a bit intimidating, but if you skip to the section titled [Geometric Interpretation](https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation) it gives a decent intuitive explanation of the algorithm. (Professor Sederberg's book gives an even better explanation of it, I think.)
4. If your environment is amenable, try implementing an interactive system, maybe on an HTML canvas element. Allow control points to be dragged around, showing how the curve changes as the control points change. This option is worth **3 points**.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, October 1st, at 12:00pm MDT (18:00 UTC).

* * *

The deadline for this challenge has passed, but feel free to try your hand at it anyway! Go ahead and submit a link to your solution in the comments, anytime. If you’re following along, the next week's challenge is "[Network programming](http://weblog.jamisbuck.org/2016/10/1/weekly-programming-challenge-10.html)". See you there!
