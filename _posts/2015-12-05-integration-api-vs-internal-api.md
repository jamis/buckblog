---
layout: post
title: Integration API vs. Internal API
categories:
- essays and rants
author: Jamis
comments: true
summary: |
  In which the author demonstrates the difference between integration
  and internal API's, and warns about an anti-pattern
---

Don't confuse an _integration API_ for your application's _internal API_.

Let me explain.

Consider a service that your application employs. That service will typically need your application to conform to some interface, so that it can interact with it. Let's call that interface the _integration API_, since it is the interface used to integrate the service with your application.

These typically manifest as callbacks. Webhooks are one form of this. GitHub, for instance, lets you specify a URL which will be sent information when some event occurs (like a commit). Parsers also use this technique, allowing you to supply a set of callbacks to be invoked at various points in the parsing process. (You encounter this pattern a lot in Java, where interfaces are used to define a set of methods to be consumed by a service.) These callbacks and methods form an _integration API_.

I'll use as a concrete example the [Pundit](https://github.com/elabs/pundit) plugin for Rails, which implements an authorization service. Normally, Pundit just needs your controllers to define a `#current_user` method, so it knows who the current user is, but sometimes that's not enough. Let's say we have a case where an administrator is allowed to act on behalf of another user. We have a _current user_, which is the administrator who is actually at the computer, and we have an _effective user_, which is the user the admin is pretending to be.

To make this work, Pundit needs to know who that effective user is (distinct from the current user), and so it requires that our controllers implement a special `#pundit_user` method that it will call in order to find that out. This `#pundit_user` method is part of the _integration API_ required by Pundit.

{% highlight ruby %}
def current_user
  @current_user ||= User.find(session[:user_id])
end

def pundit_user
  @pundit_user ||=
    User.find_by(id: session[:effective_id]) ||
      current_user
end
{% endhighlight %}

On the other hand, our application needs to expose certain bits of information to other parts of the application, internally. Our controller, for instance, might need to expose the effective user to the views. Let's call the methods that expose this information--internally to our application--the _internal API_.

So, let's say we've gotten to the point where we need to access the effective user in one of our views. It is tempting to look around and see, hey, we've already got a method that returns the effective user. Right? The `#pundit_user` method from the integration API! Rather than "duplicate" that functionality, why not just let `#pundit_user` double as the internal API?

{% highlight ruby %}
helper_method :pundit_user

# And in the view, something like:
#   User name: <%= pundit_user.name %>
{% endhighlight %}

It is tempting, for sure, to try to optimize our code like this. But my earnest advice is to _not do it_. At least, don't do it like this.

The problem with the approach above is that we wind up sprinkling "pundit" stuff all over our app, in contexts that have nothing to do with authorization. And by relying on that integration API internally, we've deeply, tightly coupled our app to Pundit. It is, in other words, an anti-pattern.

Here's a better way:

{% highlight ruby %}
def effective_user
  @effective_user ||=
    User.find_by(id: session[:effective_id]) ||
    current_user
end

helper_method :effective_user

def pundit_user
  effective_user
end
{% endhighlight %}

This makes our intention clearer, and helps us keep a clean distinction between the integration API (`#pundit_user`) and our internal API (`#effective_user`). We're more loosely coupled with Pundit, too, which makes things easier to test and maintain in the long run.

In fact, to make the distinction absolutely clear, we would probably do well to put these two things in completely separate concerns:

{% highlight ruby %}
concerning :InternalAPI do
  def effective_user
    # ...
  end
  helper_method :effective_user
end

concerning :PunditIntegration do
  def pundit_user
    effective_user
  end
end
{% endhighlight %}

Whether you buy into the `#concerning` syntax or not, hopefully the point is made. You can separate these into different modules, and your internal API has absolutely no knowledge of the integration API. Clean, simple, and clear.
