---
layout: post
title: Tapping ActiveRecord Relations
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  A technique is demonstrated, calling Object#tap to reuse an ActiveRecord
  relation instance in order to accomplish more than one task
---

*(Yes, I know I said I was probably not going to write here anymore, but while I like [Medium](http://medium.com) for long-form articles, it didn't quite fit the bill for posts that wanted syntax highlighting. Thus, I'll probably continue to use the Buckblog for technical articles, and Medium for long-form.)*

Not a lot of surprises in today's post. I just wanted to share a convenient technique that I came across this week.

You're all familiar with [`Object#tap`](http://ruby-doc.org/core-2.3.0/Object.html#method-i-tap), right? It's terribly useful, in many situations. The example from the documentation is pretty good:

{% highlight ruby %}
(1..10)              .tap {|x| puts "original: #{x.inspect}"}.
  to_a               .tap {|x| puts "array:    #{x.inspect}"}.
  select {|x| x%2==0}.tap {|x| puts "evens:    #{x.inspect}"}.
  map    {|x| x*x}   .tap {|x| puts "squares:  #{x.inspect}"}.
{% endhighlight %}

You're also probably all familiar with [`ActiveRecord::Relation`](http://api.rubyonrails.org/classes/ActiveRecord/Relation.html), at least indirectly. This is what is returned any time you query a model in ActiveRecord:

{% highlight ruby %}
User.where("created_at > ?", Date.yesterday)
#-> #<ActiveRecord::Relation [...]>
{% endhighlight %}

These relation objects allow query operations to be chained together (which you probably also already knew):

{% highlight ruby %}
q = User.where("created_at > ?", Date.yesterday)
#-> #<ActiveRecord::Relation [...]>
q = q.limit(5)
#-> #<ActiveRecord::Relation [...]>
q = q.order(:name)
#-> #<ActiveRecord::Relation [...]>
{% endhighlight %}

I've taken advantage of both `Object#tap` and the chaining of `Relation` instances, numerous times, but I don't think I've ever done them together. Recently, though, I saw it done, something like this:

{% highlight ruby %}
updated_ids = []

Composition.where(author_id: old_id).tap do |relation|
  updated_ids.concat(relation.pluck(:id))
  relation.update_all(author_id: new_id)
end

p updated_ids.uniq
{% endhighlight %}

Here, the code collects the ids (`updated_ids`) of all records that are affected by merging one author (`old_id`) into another author (`new_id`). The `#tap` block just yields the relation, appends the ids of all matching records to the array, and then updates all matching records.

*(Warning! This particular implementation has a race condition, and is not particularly efficient. A better way would be to use `UPDATE` with `RETURNING` to fetch the updated ids, thus keeping the operation atomic, and efficient. This was just a novel application of ActiveRecord::Relation with `Object#tap`...)*

I love this about writing software. No matter how familiar you become with the toolbox you've been given, someone always manages to combine those tools in ways you wouldn't have considered.
