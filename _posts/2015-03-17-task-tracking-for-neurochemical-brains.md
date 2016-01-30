---
layout: post
title: Task Tracking for Neurochemical Brains
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  Presenting a simple (and perhaps very unoriginal) technique for
  keeping track of a list of tasks in the face of interruption and
  exploration
---

I wish I could remember where, exactly, I first encountered this tip. It was on Hacker News some months back, and at the time I didn't particularly need it. But when I started consulting last month, it suddenly came back to me, and I realized just how valuable it is.

The problem is this: with multiple tasks in the air at once, how do you keep track of where you're at on each of them? It's [been shown](http://www.npr.org/templates/story/story.php?storyId=95256794) that human multitasking is generally not as effective as people tend to think. Our meaty little brains just aren't wired to focus on more than one thing at once.

Human limitation has rarely dictated physical reality, though. In today's world, there is a real need for multitasking. Interruptions, tangent explorations, new tasks being born from whatever you're working on---these are all actual problems. The trick is to find a way to keep them from overwhelming our outmoded neurochemistry.

Here's how I've been tackling it.

The first thing I do is open a new text file and name it for today's date. (Something like `tasks-20150316.txt` suffices for me.) Then, in that file, I make a list of all the things I want to accomplish that day. I usually leave some blank lines between the items, so that I can more easily add notes to them.

~~~
. Set up client development environment

. Implement migration: add `users.ticklish` field

. Ask about procedure for deploying migrations

. get specs passing

...
~~~

I might spend a minute to reorder the tasks based on priority, too. Then, I start at the top and work down the list.

As I discover subtasks that relate to the task at hand, I add those:

~~~
. Set up client development environment
  . git clone
  . bundle install
  . rake db:migrate
~~~

When a task (or subtask) is completed, I mark done:

~~~
. Set up client development environment
  X git clone
  X bundle install
  . rake db:migrate
~~~

So far, so good. No surprises, and nothing really innovative. (I mean, really. A to-do list in a text file? Hardly worth mentioning.)

Here's where it starts to earn its keep, though. If I encounter an issue as I work through a task, I add that issue as a note. Maybe it's an error or exception that's raised, or maybe it's something confusing that I need to think about. Here's a real sequence I worked through last month:

~~~
. get specs passing
  * trying to test has_secure_password, getting error
    undefined method `has_secure_password?'
    removing 'require: false' in Gemfile for shoulda-matchers
      fixes test, but gives lots and lots of warnings. perhaps
      matchers need to be explicitly required somewhere?
    spec/config/rspec.rb includes shoulda/matchers
    ah, config/rspec.rb doesn't seem to be loaded...
    totally forgot to edit config/spec_helper.rb. Cargo culting
      from master...
    closer, got error about ConnectionPool not existing. Turns
      out it's a dependency of sidekiq, which I had just removed.
      Removed those references from config/spec/rails.rb...
    funky. test fails the first time, second time migration check
      fails because schema_migrations table has been emptied (?!?)
~~~

And that was as far as I got on that task, that day. The problem was not resolved, but I had plenty of notes!

On day #2, I again sat down and opened a new text file. Pending issues from the previous day were copied over:

~~~
. get specs passing
  * trying to figure out `has_secure_password` tests...
~~~

Without those notes from the previous day, I know (from painful experience!) that I would have spent at least an hour rediscovering what I'd found out the previous day. Those notes, though, made it so that I could leap right back in and get up to speed in ten or fifteen minutes. So it was that I figured out the issue with just a bit more work:

~~~
. get specs passing
  * trying to figure out `has_secure_password` tests...
    tests fail, and then destroy schema_migrations table?
    logs show TRUNCATE TABLE on schema_migrations
    probably database_cleaner gem
      * see: https://github.com/DatabaseCleaner/database_cleaner/issues/317
      * sounds like a bug in recent version
    downgrading to 1.3.0 fixed that glitch!
 ~~~

And I finally got to check that item off the list!

~~~
X get specs passing
  ...
~~~

The coolest thing about this, though, is when you encounter an error that you've seen before. Before adopting this system, I would sit there and stew, knowing that I had seen (and solved!) this problem before, but I couldn't for the life of me remember what the solution was. Now, though, I just grep my notes for the exception.

That's not just hypothetical, either. I've actually done this! It was the most awesome feeling of victory, searching my notes, finding the solution, and having it actually work *again*, just like it did the first time. I seriously felt like Superman. Programmer of STEEL!

This has been a great system for me. Lo-fi, low investment, easy to implement---there's really no reason *not* to try it. I don't lose tasks anymore, even when I'm juggling four or five (or more!), and unless I happen to take lousy notes one day (which has happened, I'll admit), I can get up to speed each morning much more quickly than I used to.

If you've been looking for a better way to juggle multiple tasks, you should give this a try. Your meaty mass of neurochemistry might just thank you. (And if you're the guy who posted the comment on Hacker News---*I* thank you!)
