---
layout: post
title: Mazes in Swift
categories:
- Projects
author: Jamis
comments: true
summary: >
  A first foray into Apple's Swift programming language, using maze
  algorithms as the incubator
---

About a week ago I decided I wanted to get serious about learning [Swift](https://developer.apple.com/swift/). It should surprise no one that I decided to use [mazes](https://pragprog.com/book/jbmaze/mazes-for-programmers) as the scaffolding for this particular learning exercise. Maze algorithms are:

1. Simple. You can understand most of them in a single sitting.
2. Rich. Implement more than a few and you'll find yourself tapping into diverse areas of your target language.
3. Fun! With endless possibilities for variation, as well as providing rapid visual feedback, they're really quite addicting.

I gave myself a week to work on it, but due to real-life constraints it only worked out to maybe 6 hours, total. Still, I managed to:

* Implement a flexible grid and cell system,
* Implement the scaffolding of a layout system, for separating the grid from the responsibility of arranging its component cells,
* Implement a rudimentary ASCII representation of an orthogonal grid, and
* Implement the Aldous-Broder and Recursive Backtracking algorithms.

Check it out on GitHub! I'm calling it "[MazeMaker](https://github.com/jamis/MazeMaker)". Please take a look at it, and let me know what I could do better, or differently.

Now, about my process for learning Swift...

## Getting Started

Before, when I've learned a new programming language, I've gone hunting for others' code that I can use to get a sense for how the language looks, and flows. This typically lets me get a feel for the language's idioms, and how common programing tasks (like loops and branches) are accomplished.

I did it a bit differently this time. Instead of looking at existing code, I went a bit meta and instead read through [The Official raywenderlich.com Swift Style Guide](https://github.com/raywenderlich/swift-style-guide). I knew, going in, that a style guide was going to be a pretty opinionated document. For instance, if I were to read someone else's Ruby style guide, I suspect I'd agree with parts and disagree with other parts. So I know that experienced Swift programmers may agree with parts of the raywenderlich.com style guide, and disagree with others, but that's okay.

It's a starting point, right? And, honestly, the recommendations it makes are sensible, and they showed me quite a few idiomatic ways to accomplish things.

It worked well, for me. (So well, actually, that it makes me want to try learning another language, using a style-guide as the launch pad.)

## Generics

Swift has [generics](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html#//apple_ref/doc/uid/TP40014097-CH26-ID179). Going into Swift, I felt like I had a decent grasp on the concept, having played with them in other languages, and so I immediately started trying to build my grid and cell system around them.

Like this.

A `Cell` has a `Location`. (This is an abstraction that Corey Haines used to great effect in his book, [Understanding the Four Rules of Simple Design](https://leanpub.com/4rulesofsimpledesign): treat the location as a separate, abstract entity, rather than encoding coordinates directly on the cell. I have unashamedly used this technique ever since.)

Given that there can be different kinds of `Location` (e.g. orthogonal, polar, hexagonal, 3D, etc.), this means that `Cell` should be parameterized, based on the location. This worked okay, at first:

{% highlight swift %}
public protocol Location : Hashable {
}

public class Cell<T: Location> : Hashable {
  let cells: Set<T> = Set()
}
{% endhighlight %}

Things got ugly, though, when I tried to specify `Grid` as another parameterized class (generic), because grids are composed of particular kinds of cells. I couldn't figure out how to describe a nested generic type specification:

{% highlight swift %}
// hint: this doesn't work
public class Grid<T: Cell<U>> { ... }
{% endhighlight %}

In retrospect though, this wasn't what I wanted, either, because grids can be composed of [multiple distinct cell classes](http://weblog.jamisbuck.org/2015/11/28/upsilon-mazes.html).

In the end, I made `Location` an abstract class and used elementary inheritance to derive the concrete locations. (Currently just [`GridLocation`](https://github.com/jamis/MazeMaker/blob/master/MazeMaker/GridLocation.swift).) `Cell` itself, then, just references a `Location`, and `Grid` simply references `Cell`. Much simpler. (It does require some type casting, but I have to say, Swift's [type casting system](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/TypeCasting.html#//apple_ref/doc/uid/TP40014097-CH22-ID338) is brilliant. The way it seamlessly incorporates the idea of [optionals](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/OptionalChaining.html#//apple_ref/doc/uid/TP40014097-CH21-ID245) is really a fun way to think about it.)

## Extensions

Another thing I find really neat about Swift is the idea of [extensions](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Extensions.html#//apple_ref/doc/uid/TP40014097-CH24-ID151). This is a concept that Ruby programmers will be very comfortable with--adding new functionality to existing (even core) classes. In my case, I found myself wanting to grab random elements from sets and arrays (ala Ruby's `Array#sample` method), so I was able to easily extend both [`Set`](https://github.com/jamis/MazeMaker/blob/master/MazeMaker/Set.swift) and [`Array`](https://github.com/jamis/MazeMaker/blob/master/MazeMaker/Array.swift) to do so. This makes the algorithm implementations much more concise and elegant (see [Recursive Backtracker](https://github.com/jamis/MazeMaker/blob/master/MazeMaker/RecursiveBacktracker.swift)).

## Expressiveness

Going into Swift (and having prior experience with Objective-C), I was ready to sacrifice Ruby's expressiveness on the altar of necessity. I was expecting verbose API's, lots of boilerplate, and (relatively) awkward idioms. The truth is, that Swift has proved to be almost as concise as Ruby in many instances, and perhaps more concise in others. There is very little boilerplate, and the idioms I'm accustomed to in Ruby frequently translate over. (Swift's `Array.filter` method is one great example.)

## Interactivity

Playgrounds in Xcode are definitely promising, but they still leave a lot to be desired compared to (for example) Ruby's `irb`. I've found they get confused easily if you don't explicitly rebuild the project, and even then, I've had to "kick it" a few times in order to get it to actually recognize a change I've made in my code. (Maybe I'm doing something wrong, though?) Still, it's miles ahead of Objective-C development, where the only way to see how something worked was to write a simple little program that linked everything in, and run it.

## Conclusion

Overall? I'm really pleased with Swift. It's pleasant to work with, fast to iterate with, and I look forward to doing more with it! I'm especially excited to build out [MazeMaker](https://github.com/jamis/MazeMaker) some more. Stay tuned!
