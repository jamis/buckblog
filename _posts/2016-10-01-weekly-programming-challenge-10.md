---
date: 2016-10-01
layout: post
title: "Weekly Programming Challenge #10"
categories:
- projects
author: Jamis
comments: true
summary: Socket programming
---

When I was first learning Ruby--going on 15 years ago, now!--I cast about for a project to cut my teeth on, and decided to write a simple HTTP server. It was a great project, with a surprising capacity for exploration and discovery. Network programming can be an exciting area to play around in.

This week, let's try writing a simple client and server (not necessarily HTTP), and see where they take us.

First, though, let's recap week #9.

## Week #9 Recap

For the [9th weekly programming challenge](http://weblog.jamisbuck.org/2016/9/24/weekly-programming-challenge-9.html), we implemented Bezier curves.

1. **Kamil Jasani** went all in on this one, implementing a really fun interactive Bezier playground in Java. Check it out here: [https://github.com/ExtraCrafTX/RationalBezierCurves](https://github.com/ExtraCrafTX/RationalBezierCurves). This submission covered normal mode, as well as cubic curves (and generally curves of arbitrary degree), rational curves, de Casteljau's algorithm for splitting curves, _and_ an interactive interface for playing with them, earning the maximum score of **7 points**. And for all the extras in the interface (animating the curve, creating and remove curves, and more), I'd say it definitely qualifies for "surprise me". Well done, Kamil!
2. **Martin Moberg**'s submission (in ClojureScript) earned him **4 points**, for normal mode and an interactive environment. Check it out here: [https://github.com/indifferen7/curves](https://github.com/indifferen7/curves)
3. **Jérôme De Cuyper** submitted a Javascript implementation for normal mode. You can play with it via JSFiddle, here: [http://jsfiddle.net/jdecuyper/r7rnr56h/1/embedded/result,html/](http://jsfiddle.net/jdecuyper/r7rnr56h/1/embedded/result,html/). For normal mode, plus an interactive environment, **4 points**.
4. **Sriram Thaiyar** implemented normal mode, as well as cubic curves, earning **2 points**. Check out the Javascript source code here: [https://github.com/sri/weekly-challenges/tree/master/009-bezier-curves](https://github.com/sri/weekly-challenges/tree/master/009-bezier-curves).
5. **Lasse Ebert** also implemented normal mode in Elixir, and even used his PPM renderer from [week #4](https://medium.com/@jamis/weekly-programming-challenge-4-7fe42f28d5d4)! For normal mode, **1 point**. For reusing code from a previous challenge, **kudos**. Very nice. :) Check out his solution here: [https://github.com/lasseebert/jamis_challenge/tree/master/009_bexier](https://github.com/lasseebert/jamis_challenge/tree/master/009_bexier).

For my solution, I went with Swift and wrote a Mac OSX app. If you run OSX, you can download the app [here](http://jamisbuck.org/files/BezierDemo.zip) -- 2MB, zip file. The sources are here: [https://github.com/jamis/weekly-challenges/tree/master/009-bezier-curves](https://github.com/jamis/weekly-challenges/tree/master/009-bezier-curves). I implemented an interactive playground (not quite as nice as Kamil's!) that lets you create curves of arbitrary degree, split curves, and apply weights to control points (for rational curves). Thus, it qualifies for **7 points**.

Awesome work, everyone!


## Weekly Challenge #10

This week, let's learn a bit about _socket programming_. This is that magical thing where you write a program that talks to another program over the network, and they pass information back and forth.

Seriously though, I wish I knew it well enough to introduce it coherently, but sadly, I don't. What's more, the way you approach it may differ depending on the environment you're in, so any explanation I give would probably only help a few people anyway.

My recommendation, if you're not already familiar with socket programming in your language of choice, is to do what you would probably do anyway, even without my recommendation: Google it. :)

Other resources that might be helpful:

* [Beej's Guide to Network Programming](http://beej.us/guide/bgnet/)


## Normal Mode

For normal mode, you're actually going to have to write _two_ programs:

**The client**. This must do the following things, mostly in the following order:

1. It must connect to a server running on a host and port that you specify.
2. It must read six (6) bytes from the server: "ready\n" (that's a newline at the end). This indicates that the server is ready for the query.
3. It must send the length of the query as a 4-byte word.
4. It must then send the query (see below).
5. It must then read a 4-byte word from the server, indicating the length of the response.
6. It must then read that many bytes from the server, to be displayed as the result of the query.
7. It must then close the connection.

The query may be anything you desire. It could be fun to tie in some of the previous weekly challenges here. Maybe the query is a number, and the response is that number of [randomly generated Sindarin names](https://medium.com/@jamis/weekly-programming-challenge-2-33ef134b39cd). Or maybe the query is a maze, and the response is the [solution to that maze](https://medium.com/@jamis/weekly-programming-challenge-3-932b16ddd957). Or maybe the query consists of two coordinate pairs, and the response is [an image of line connecting those two points](https://medium.com/@jamis/weekly-programming-challenge-4-7fe42f28d5d4). Or maybe you just want to be boring and have the server echo the client's query. Whatever you like!

**The server**. This must do the following things, also in the following order:

1. It must listen for connections on a port that you specify.
2. When a connection is received, it must send six (6) bytes to the client: "ready\n".
3. It must read a 4-byte word from the client, indicating the length of the query to read.
4. It must read that many bytes as the query, and then perform the requested query (see above).
5. It must send a 4-byte word to the client, indicating the length of the response.
6. It must send the response.
7. It must then close the connection.
8. It must return to step #1.

Easy-peasy! Or at least, feasible-peasible. Or something. :) Finishing normal mode (both programs!) grants you **one point**.


## Hard Mode

For hard mode, I'm going to challenge you to write a simple HTTP client and/or server. (I do mean simple! You're not trying to reimplement Apache or NGINX or anything.) You are not allowed to use any prexisting HTTP networking libraries--that would defeat the purpose. :) But you are certainly welcome to use lower-level networking libraries.

HTTP is not difficult, fundamentally. There are all kinds of tutorials online, but [here's one](https://www.jmarshall.com/easy/http/#structure) that explains the basics of the request and response syntaxes. Ultimately, HTTP works much like normal mode, with the client sending a request, and the server responding. The devil is in the formatting of those requests, but it can be done!

Unlike other weeks, this hard mode may be done independently of normal mode. You can even skip normal mode if you want (though if you skip it, you don't get the point that normal mode awards you).

Earn one hard-mode point each for implementing the following features.

In your HTTP client (if you choose to write one):

* **GET**. You specify a host, port, and path, submit the query as a GET request, and then display (or store) the response.
* **POST**. Again, you provide a host, port, and path, as well as a series of `name=value` pairs, and send them to the server as a POST request.

In your HTTP server (again, if you choose to write one):

* **GET**. Respond to GET requests for static resources (e.g. files on disk).
* **POST**. Respond to POST requests by creating new files with the contents of the POST request.
* Support the [Common Gateway Interface](https://en.wikipedia.org/wiki/Common_Gateway_Interface) (CGI). This permits requests to invoke programs via your web server, which in turn produce the output for the response.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, October 8th, at 12:00pm MDT (18:00 UTC).

* * *

Post a link to your submission in the comments, but please: only link to your solution. Do not post source code in the comments. Comments that post source code directly will be removed. If you have any questions about this challenge, post them in the comments as well and I’ll try to clarify.

If Disqus (the comment system) gives you any grief, please feel free to email your solution to me directly, at jamis@jamisbuck.org.
