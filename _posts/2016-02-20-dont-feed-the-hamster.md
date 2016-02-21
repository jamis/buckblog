---
layout: post
title: Don't Feed the Hamster the Whole Stalk
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  A parable is presented about reasonable API design
---

API design has many pitfalls. Allow me to illustrate one with a story.

* * *

> "Fabian!"
> 
> The bellow was answered--from across the house--with a sigh, as Fabian stopped scrubbing the floor and sat back on his ankles. It never failed. Right in the middle of the fall cleaning. He rubbed his eyes and wiped suds from his goatee, counting.
> 
> _six...seven...eight..._
> 
> "Fabian!"
> 
> Fabian nodded. "Eight seconds. It must be serious." Shaking his head, he cleared his throat and shouted back.
> 
> "Coming, sir!"
> 
> With another sigh, he got up and made his way down the hall, through the parlor, past a glass terrarium that he did _not_ want to think about, down another hall, and into his master's laboratory.
> 
> It was a rather spectacular laboratory, Fabian had to admit. Spectacularly _ramshackle_. His fingers itched just stepping in. More than once he'd begged on bended knee to be allowed to tidy the lab, but his master would have none of it.
> 
> Basil Smockwhitener was, after all, a very opinionated man.
>
> Wizard.
> 
> Whatever.
> 
> "You called, sir?"
> 
> Basil did not look up, but remained intently focused on some complex arrangement of glass and metal tubes on the table in front of him. He absently stroked his enormous white mustaches. "I did. I wanted to remind you to feed Caesar."
> 
> Fabian's heart fell. "Caesar, sir?"
> 
> The wizard looked up, then. "Yes, Caesar. Surely you've not already forgotten the newest member of our household?"
> 
> "No, sir. How could I, sir? His terrarium occupies my favorite seat."
> 
> "Quite. Very good. Now go feed him." Basil looked back down at his work again.
> 
> Fabian paused. The hamster was a gift from Widow Esmarina in town, given in trade for some bit of household magic that Basil had wrought for her. At the best of times, Fabian was not what he would call a "pet person", but given that Basil had not only taken the furry rat in, but had placed it on Fabian's favorite comfy chair...
> 
> Frankly, he'd been hoping that his master would go typically absent-minded, and forget about the vermin until long after Fabian could bury it.
> 
> "Very good, sir. I'll, um, feed it. But--"
> 
> Basil looked up again. "But?"
> 
> "Well, sir, it's just that I don't know what these...creatures...eat."
> 
> Basil waved a hand dismissively. "Oh, whatever, Fabian. Corn, or something, I'm sure. Figure it out."
> 
> _Figure it out_. Fabian sighed, feeling particularly put-upon. "Very good, sir."
> 
> He left the laboratory, thinking thoughts of corn. The garden this year had done particularly well, and there were two full rows of tall, handsome cornstalks standing sentinel over the lesser produce.
> 
> He nodded decisively. That would do nicely.
> 
> He went outside, shielding his eyes from the late-afternoon sun, and marched quickly to the garden. He eyed the corn critically before grabbing one of the stalks near the base, crouching like a sumo wrestler, and heaving.
> 
> After several long, curse-filled minutes he hobbled into the house, clutching his back, and came back with a knife. When he returned to the house again, he was dragging eight feet of bedraggled cornstalk behind him.
> 
> Into the parlor he pulled his prize, sweaty and irritated, and then paused in front of the glass terrarium. It was about two feet by one foot, and about a foot-and-a-half tall, with a small, furry rodent inside that was eyeing Fabian with no small amount of trepidation.
> 
> "Hail, Caesar," Fabian muttered. "It's dinnertime."
> 
> It wasn't easy, but with a lot of bending and folding and ripping and swearing, Fabian managed to cram all eight feet of cornstalk into three cubic feet of terrarium. Caesar seemed right home in his box of foliage, nibbling eagerly at a convenient ear.
> 
> Fabian shrugged, winced, rubbed his back, and went back to cleaning the floor.
> 
> The next morning, Caesar was nowhere to be found. Basil was furious, demanding to know why Fabian had provided such an easy ladder for the hamster to escape. The Widow Esmarina was heartbroken, fearing that the poor creature would be picked up by an owl or hawk. Or dragon.
> 
> Fabian, for his part, got on as he always had, and simply tried to ignore the scratching in the walls at night.

* * *

Poor Fabian. And yet, his mistake is one that I've seen many people make--myself included. You have a system that needs some particular data as input, and what do you do? You take whatever happens to be able to satisfy that dependency, and cram it into the metaphorical terrarium.

Let me give a more concrete example, and maybe you'll see better what I mean.

Consider a system where users can discover new books to read. They come in, say who their favorite authors are, and the system tells them all the books by those authors, as well as where those books can be purchased, and how much they cost, and how many other users have read each book, etc, etc.

Well, then. Our `User` model might look something like this:

{% highlight ruby %}
class User < ActiveRecord::Base
  has_many :favorite_authors,
    through: :favorite_authors,
    class_name: "Author"
end
{% endhighlight %}

And then we have some system that we're going to use to fetch all the other data we want, so that we can tell the user all the books by their favorite authors, and lots of yummy statistics besides.

The Fabian Method of Feeding the Hamster the Entire Stalk™ looks something like this:

{% highlight ruby %}
class FavoritesQuery
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def result
    authors = user.favorite_authors
    # ...
  end
end

user = User.find(...)
favorites = FavoritesQuery.new(user)
{% endhighlight %}

We just indiscriminately crammed the entire user object down the throat of our poor `FavoritesQuery`, when all we really needed was the list of favorite authors!

But wait! Is this really so bad?

I say, "yes," and here's why.

1. *Mental overload*. Someone new looking at the `FavoritesQuery` implementation is not going to immediately see what it needs with the user parameter. How much of a user does the query need? Is it doing something with the user's email address? Favorite color? Meal preference? WHAT DOES IT NEED?!
2. *Testability*. Want to write a unit test for the `FavoritesQuery` class? You're going to need to instantiate (or stub) a `User` instance to feed to it. Kind of a pain, especially if users are complicated to instantiate.
3. *Reusability*. Want to use the `FavoritesQuery` somewhere else, where you're just trying to get information about a list of authors that aren't part of a favorites list? You'll need to create a dummy user with a list of favorite authors in order to conform to the protocol, here. What a pain!
4. *Ripple effect*. Let's say, down the road, you change the `User` class and rename the `favorite_authors` association. (Maybe now it's `beloved_authors` or something.) Suddenly you start getting errors in your `FavoritesQuery` class. This is particularly insidious when it's not a method name that changes, but the contract of the method itself. Maybe the method no longer returns Author objects, or maybe the semantics have changed, and the authors it returns are no longer favorites.

These four points describe what is called [tight coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)). You're tying the `FavoritesQuery` class tightly to the `User` class. That's a strong dependency, and it is generally not a good thing.

So how do we fix it?

Well, for one thing, _don't feed the hamster the entire cornstalk_. Think about what the hamster needs. Does it eat corn? Give it a few corn kernels instead.

In this case, let's design `FavoritesQuery` to depend on a list of authors, instead of the user object:

{% highlight ruby %}
class FavoritesQuery
  attr_reader :authors

  def initialize(authors)
    @authors = authors
  end

  def result
    # ...
  end
end

user = User.find(...)
favorites = FavoritesQuery.new(user.favorite_authors)
{% endhighlight %}

Much better. That `FavoritesQuery` is now more easily testable and reusable (since we can just pass it a list of authors), and we've reduced the mental overhead associated with reading this code, too.

More maintainable, more testable, more reusable...that sounds like a win to me.

So, next time you're designing an API, think of the hamster and what it really needs. Just feed it a few corn kernels. It'd be a pity to find yourself waking up in the middle of the night to the gentle scratching of an emergency phone call because your hamster escaped on the ladder of complexity your cornstalk created.

* * *

_If you find yourself wanting more Basil & Fabian, perhaps you'd like to read the novella I wrote during the summer of 2014. It's online, and free, and uses Basil & Fabian as a vehicle for teaching pathfinding algorithms. [Give it a read!](http://blog.jamisbuck.org)_
