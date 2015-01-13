module LegacyCommentsFilters
  def has_legacy_comments(input)
    site = @context.registers[:site]
    post_id = input['post_id']
    comments = (site.data['comments'][post_id.to_s] || [])

    comments.any?
  end

  def legacy_comments(input)
    site = @context.registers[:site]
    post_id = input['post_id']
    comments = (site.data['comments'][post_id.to_s] || [])
  end
end

Liquid::Template.register_filter(LegacyCommentsFilters)
