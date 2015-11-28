module PostFilters
  def minutes_to_read(input)
    sanitized = input.gsub(/<.*?>/, "")
    words = number_of_words(sanitized)
    (words / 250.0).ceil
  end

  def debug(input)
    p input
    input
  end
end

Liquid::Template.register_filter(PostFilters)
