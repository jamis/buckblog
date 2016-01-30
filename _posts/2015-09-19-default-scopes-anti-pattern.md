---
layout: post
title: "Default Scopes are an Anti-Pattern"
categories:
- essays and rants
author: Jamis
comments: true
summary: >
  ActiveRecord's default_scope feature is exposed as an anti-pattern,
  with examples showing two common ways it is abused. It is proposed
  that explicit scopes are a superior solution
---

Most of you will be familiar with "default scopes" in ActiveRecord, the feature that lets you apply conditions automatically to all queries on a given model. For example, suppose we have a system where a blog author can be deleted (perhaps to remove their access to the blog), while preserving their associated posts. A default scope could then be added to automatically exclude these deleted authors:

{% highlight ruby %}
class Author < ActiveRecord::Base
  has_many :posts

  default_scope { where(deleted: false) }

  def delete
    update(deleted: true)
  end
end
{% endhighlight %}

The author is "deleted", but the record (and their corresponding posts) remain. It's a tempting pattern, because the promise is that you no longer have to remember to ask for only the active authors:

{% highlight ruby %}
Author.all #-> automatically excludes all deleted authors
{% endhighlight %}

Unfortunately, this scope applies _everywhere_, even to associations that rely on authors. Using this pattern to hide authors but show posts will cause problems because asking a post for its (deleted) author will now return `nil`. To work around this, you have to explicitly unscope `Author` before querying:

{% highlight ruby %}
post.author #-> returns `nil` if author.deleted is true

author = Author.unscoped { post.author }
{% endhighlight %}

This completely breaks expectations. As a software author, when I ask a record for an associated object, I never want hidden conditions to be applied to that query--and yet, that's exactly what default scopes do.

This is why I call default scopes an _anti-pattern_. According to the definition on [Wikipedia](https://en.wikipedia.org/wiki/Anti-pattern), an anti-pattern:

1. Is a commonly used pattern of action that appears to be an effective response to a problem, but typically has more bad consequences than beneficial results, and
2. Has a good alternative solution that is documented, repeatable and proven to be effective.

"Bad consequences?" Yup. Let's look at some more, before I address the alternative solution. Consider what happens if I want to see only deleted authors. This won't work:

{% highlight ruby %}
Author.where(deleted: true)
{% endhighlight %}

Why? That query is actually asking for all authors where `deleted` is _both_ true _and_ false! The default scope is _still_ applied. The bandaid, once again, is to explicitly unscope Author first:

{% highlight ruby %}
Author.unscoped.where(deleted: true)
{% endhighlight %}

The problem here is that `default_scope` changes the behavior of model queries in ways that aren't obvious simply by reading the code. _It adds a hidden behavior that betrays expectations_. `Author.all` now breaks the implicit promise of returning _all_ authors. `Author.where` now misleads by promising a certain query, but issuing another. This leads to wasted time hunting for subtle bugs. _Bad consequence!_

## Default Sort Order

Another common use of `default_scope` is to apply a global sort condition to a model, like this:

{% highlight ruby %}
class Post < ActiveRecord::Base
  belongs_to :author

  default_scope { order("created_at DESC") }
end
{% endhighlight %}

Here, we're assuming that posts will always be sorted with the most recent first. This seems like another great idea, since that's how blog articles are almost always listed. Plus, because it's a default scope, we get both `Post.all` and `author.posts` sorted just the same!

A minor nitpick with this is that it can obscure the indexes that you need to add for that table. When adding that default scope, it's easy enough to see that you want to put an index on `created_at`, right? And since posts belong to authors, you'll want an index on `author_id`, too. But will you remember that because of that default scope, the `author_id` index should include `created_at`? If you later decide that posts can be queried by subject, will you remember to include `created_at` in that index, too? A default sort order becomes a kind of virus that reaches into queries in potentially surprising ways, and wreaks havoc on your database performance.

A bigger issue, though, is that (just like we saw with the default scope on `Post`) the default sort becomes annoyingly persistent. Suppose there is some place in your application where you actually want to sort posts some other way? Well, I hope you like your default sort order, because it will _always take precedence_.

{% highlight ruby %}
  Post.order("created_at ASC")
  #-> "... ORDER created_at DESC, created_at ASC"
{% endhighlight %}

The results will be sorted _first_ by your default sort condition, and then by any other conditions you want to add. Again, this completely betrays expectations, and the work-around is to remember to add that `unscoped` call there. Easy to fix once identified---but often subtle and tricky to troubleshoot. _Bad consequence!_

The trouble with `unscoped` is just this: it ultimately presupposes that you always know in advance exactly what effect the existing default scopes will have on your query, and the more default scopes you have, the more difficult it gets to keep that all straight, especially over months of developing a system.

So, those are the drawbacks. What about a "good alternative solution"? What should we do instead? _Use explicit scopes._

## Use Explicit Scopes

But that's more work, right? Actually, it's not. Being explicit makes your code more readable, understandable, and consequently more maintainable. You'll _save_ time in the long run. Want all active authors? Add an `active` scope, and use it.

{% highlight ruby %}
class Author < ActiveRecord::Base
  has_many :posts

  scope :active, -> { where(deleted: false) }
  scope :deleted, -> { where(deleted: true) }

  def delete
    update(deleted: true)
  end
end

Author.all # all authors
Author.active # all active authors
Author.deleted # all deleted authors
post.author #-> always works as expected
{% endhighlight %}

Want posts to be sorted by how recent they are? Add an explicit scope:

{% highlight ruby %}
class Post < ActiveRecord::Base
  belongs_to :author

  scope :by_date, -> { order("created_at DESC") }
end

Post.by_date #-> all posts in descending order
author.posts.by_date #-> author's posts in descending order
{% endhighlight %}

Is it more characters? Yes, undoubtedly. But it's far more self-documenting, and far less-surprising, then the implicit behaviors of `default_scope`. Is it bug-proof? Heck, no. But I've found that leaving an explicit scope off by accident is usually a bug that is quickly noticed and easily fixed, whereas recognizing an over-zealous default scope is generally much more subtle and time-consuming to troubleshoot.

Be kind to your teammates and your future self. Make your code more readable and maintainable. Avoid the `default_scope` anti-pattern.
