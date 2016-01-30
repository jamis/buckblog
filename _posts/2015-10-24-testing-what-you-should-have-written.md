---
layout: post
title: Testing What You Should Have Written
categories:
- essays and rants
author: Jamis
comments: true
summary: >
  Some observations on the risks involved in writing tests for code
  that is already written
---

I'll say it right now: I'm not a testing guru. I've not read extensively about testing, and--confession time!--I still tend to think more about tests after the fact than I do in the moment.

(I'm getting better, though. Practice makes perfect.)

I've recently been thinking a lot about testing, though, comparing the projects I've done test-first, versus those done test-last, and I've noticed some things. These are probably going to seem obvious, but that's because they _should_ be:

1. When I write tests first, I'm testing the code that I _should_ write. I'm thinking about the specification, and the intended behavior. The tests shape the code.
2. When I write tests last, I'm _trying_ to test code that I _should have written_. However, because the code is there in front of me, I'm crippled by all kinds of biases and assumptions. The tests more often wind up testing _what I wrote_. The code shapes the tests.

The difference between "testing the code that I should write" and "testing the code that I wrote" is significant. Consider this (trivial) example. Let's suppose I needed to write some tests for the following method:

{% highlight ruby %}
def operate_on(a, b)
  if a > b
    a - b
  else
    b - a
  end
end
{% endhighlight %}

I'd probably wind up with a method that tests the case where `a` is greater than `b`, and another testing the case where `b` is greater than `a`.

{% highlight ruby %}
def test_operate_on_when_a_gt_b
  assert_equal 2, operate_on(5, 3)
end

def test_operate_on_when_b_gt_a
  assert_equal 2, operate_on(3, 5)
end
{% endhighlight %}

If I were being particularly vigilant, I'd probably write one for the case where they are equal, too.

{% highlight ruby %}
def test_operate_on_when_a_eq_b
  assert_equal 0, operate_on(5, 5)
end
{% endhighlight %}

Then I'd look back at feel all warm and fuzzy because my tests cover all the branches of my method. And I have tests! There's no denying that it is better to have tests, than to not have tests.

But what this test-last strategy misses is that I'm looking at the implementation here, not the specification. I'm treating the code (as implemented) as the intended behavior. What if there was supposed to be some special case when `a` and `b` were equal? Maybe, in that case, it's supposed to raise an exception. My test-last strategy has completely overlooked that case, because it was absent from the code.

_The code by itself may not suffice as a specification of behavior._

Testing last, I wind up confirming the existing behavior, rather than validating the correct behavior. Often, what was written _is_ the correct behavior, but the problems happen when they aren't. I've found that complicated logic is especially prone to this. I'll work through a tricky bit of code, and then later go to test it. I'll look at the logic and say "with this input, it gives this output", and so I test that, even though the logic itself might be wrong (or incomplete). The tests all pass...but what does it mean?

It means I've got a case of false confidence.

Now, it's not necessarily catastrophic, right? Testing last is better than not testing at all. Bugs are discoverable in lots of ways, and once you find them, you fix them and add tests to make sure they don't resurface later. But don't let those tests blind you to the reality.

_Tests written after the fact will tend to be shaped by the code they are supposed to cover._

If that's the way it has to be, go into it with your eyes open. Challenge assumptions. Root out biases. And be prepared to ask a lot of questions.
