---
date: 2016-09-17
layout: post
title: "Weekly Programming Challenge #8"
categories:
- projects
author: Jamis
comments: true
summary: >
  Implement a simple parser and interpreter
---

Parsers are some of my favorite things, and like many favorite things, they're something I don't get to do very often. I have to make opportunities for them, which is why we're going to be applying ourselves this week to writing one!

But first, let's recap week #7.

## Week #7 Recap

For the [7th weekly programming challenge](https://medium.com/@jamis/weekly-programming-challenge-7-286640364537), we set ourselves to implement a B+ tree and its associated algorithms (at the very least, the insert and search operations). Three brave souls rose to the challenge!

1. **Marcus Edvinsson**'s solution is in Haskell, here: [https://github.com/MarEdv/wpc-week7](https://github.com/MarEdv/wpc-week7). He also implemented the configurable key/value data types requirement from hard mode, earning **2 points**.
2. **Lasse Ebert** submitted a solution for normal mode in Elixir, here: [https://github.com/lasseebert/jamis_challenge/tree/master/007_bex](https://github.com/lasseebert/jamis_challenge/tree/master/007_bex).
3. **Radu Balaban** did his normal mode submission in Typescript (a first for these weekly challenges!). Check it out here: [https://github.com/radu-b/bplus-tree](https://github.com/radu-b/bplus-tree).

Awesome work!

My solution (in Javascript) is here: [https://github.com/jamis/weekly-challenges/tree/master/007-b-plus-tree](https://github.com/jamis/weekly-challenges/tree/master/007-b-plus-tree). It implements normal mode (one point), as well as linking the leaf nodes together (one point), and a binary-search for finding children within a node (one point), for a total of **3 points**. I also implemented an HTML/SVG demo that illustrates the algorithm for adding keys to a B+tree. I didn't get as far on it as I would have liked, but it's still fun to play with! Check out the demo here: [http://jamisbuck.org/b-plus](http://jamisbuck.org/b-plus).


## Weekly Challenge #8

This week, we're going to implement a simple [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser), for a basic calculator. The final result will allow you to feed it an expression, and your program will parse it, evaluate it, and print the result.

If you've never implemented a recursive descent parser before, I hope you won't be scared off! It's actually really straight-forward. There are three parts to this:

1. **The scanner**. The scanner will take as input some string of characters, and convert them into an array of _tokens_. That is, if I give it the string "3 + 4", the scanner will convert that into three tokens. The first token would have type "number" and value "3", the second would have type "plus", and the third would be another "number" with value "4".

2. **The parser**. The parser will take that stream of tokens, and convert them into an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST) using some grammar (see below). The root of our AST will be an _expression_. It's children will be other (sub-)expressions, and concrete values. For example, given "3 + 4", the AST would be an expression with operator "+", and two children, "3" and "4". (More complex expressions would result in deeper trees.)

3. **The interpreter**. The interpreter will take an AST, and starting at the root will recursively evaluate the expression it represents. The value of an expression node, is the operator applied to its children, which may (in turn) be other expressions.

For consistency, our basic grammar will be this one:

{% highlight text %}
expression = term expr-op ;
expr-op    = '+' expression
           | '-' expression
           | () ;

term    = factor term-op ;
term-op = '\*' term
        | '/' term
        | () ;

factor = integer
       | '(' expression ')'
       | '-' factor ;

integer = '0' | '1' | '2' | '3' | '4'
        | '5' | '6' | '7' | '8' | '9' ;
{% endhighlight %}

That is to say, an `expression` is a `term`, followed by an `expr-op` (expression operation). `expr-op`, in turn, is either a plus or minus followed by another `expression`, or it is the empty set (nothing), and so on.

To implement this as a recursive descent parser, you implement a function for each of the left-hand rules (`expression`, `expr-op`, `term`, etc.), and have those functions return a subtree representing what was parsed. Thus, you'll have nodes for (at least) _expression_ (which will encapsulate '+' and '-' operations), _term_ (for '\*' and '/' operations), _factor_ (for parenthesized or negated sub-expressions), and _negation_ (for factors that are prefixed with a minus sign), as well as possibly _integer_ (to represent a concrete integer value).

Implementing a scanner, parser, and interpreter for that grammar will earn you normal mode, and one point! (I promise, though--once you wrap your mind around recursive descent parsers and abstract syntax trees, this challenge will come together quickly.)

Try your parser on the following expressions:

* `1 + 2` (should be 3)
* `2 * 8` (should be 16)
* `4 + 2 * 8` (should be 20)
* `(4 + 2) * 8` (should be 48)
* `((((5)+2)*2)-5)/3` (should be 3)
* `6 * -3` (should be -18)
* `-(5 * 2) - 2` (should be -12)

Maybe you want more challenge, though. If so, read on...

## Hard Mode

For hard mode, you can earn one extra point each for implementing any of the following extensions to your parser:

1. **Exponentiation**. Exponentiation (we'll use a caret '^' as the operator) has a higher precendence than multiplication and division, but lower than parenthesis. (That is to say, `4 * 2 ^ 3` should be 32, not 512.) You'll need to add a new rule, like was done for `expression` and `term`, to make sure exponents are given the correct precedence.
2. **Variables**. Add a new expression type, `assignment`, which accepts a variable name on the left, and an expression on the right. This operation will set the value of the named variable to the result of the expression. The value of the assignment expression as a whole is the new value of the variable. These variables may be used anywhere a `factor` may be used.
3. **Multi-expressions**. Add a new operator, ';' (semicolon), which takes two expressions and always returns the value of the last expression. This can be used to combine multiple expressions like statements (e.g. `x = 5; y = 3; (x + 1) * y` would return `18`).
4. **Ternary operator**. The ternary operator looks like this: `x ? y : z`. For our purposes, if `x` is not `0`, the expression returns `y`. Otherwise, it returns `z`.
5. **Built-in Functions**. Implement at least one built-in function, like sine, cosine, tangent, or logarithm. As far as the grammar is concerned, a function call would be implemented with `factor`.
6. For a _real_ challenge, try **custom functions**. I'll let you decide on your own preferred syntax, but a function declaration ought to be an expression of some sort. You can assign them to variables, or use them directly in other expressions. You can decide whether you want variables to have local or global scope. This will be worth **3 points**.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, September 24th, at 12:00pm MDT (18:00 UTC).

* * *

Post a link to your submission in the comments, but please: only link to your solution. Do not post source code in the comments. Comments that post source code directly will be removed. If you have any questions about this challenge, post them in the comments as well and I’ll try to clarify.

If Disqus (the comment system) gives you any grief, please feel free to email your solution to me directly, at jamis@jamisbuck.org.
