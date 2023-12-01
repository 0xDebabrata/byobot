drop function get_this_weeks_gpts();

create or replace function get_this_weeks_gpts()
returns table(
  id bigint,
  name varchar,
  slogan varchar,
  slug text,
  logo_url varchar,
  demo_url varchar,
  votes_count bigint,
  views_count bigint,
  api_spec text,
  api_type text
) as $$
  begin
    return query
      select p.id, p.name, p.slogan, p.slug, p.logo_url, p.demo_url, p.votes_count, p.views_count, p.api_spec, p.api_type
      from products p
      where p.created_at >= now() - interval '7 days'
      order by p.votes_count desc;
  end;
$$ language plpgsql security invoker;
