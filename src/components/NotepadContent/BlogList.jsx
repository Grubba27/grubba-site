import { useQuery } from "@tanstack/react-query";
import { Button, Checkbox } from "@react95/core";
import styled from "styled-components";
import DefragSpinner from "./DefragSpinner";
import { postsQuery } from "../../services/devto";

// the checkbox is sized for one line of 12px text, and this label can wrap
const Filter = styled(Checkbox)`
  && {
    height: auto;
    line-height: normal;
  }
`

const Tags = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`

// the tag being filtered by stays pressed in, like the button of the open window in the taskbar
const Tag = styled(Button)`
  && {
    padding: 5px 10px 4px;
    outline-offset: -3px;
  }

  &&:active {
    padding: 6px 9px 3px 11px;
  }

  &&[aria-pressed="true"] {
    background-color: var(--r95-color-borderLighter);
    box-shadow: var(--r95-shadow-in);
  }
`

const Actions = styled.p`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`

// the tags worth filtering by are the ones that group posts, from the most to the least used
const getSharedTags = (posts) => {
  const uses = new Map();
  posts.flatMap((post) => post.tag_list).forEach((name) => uses.set(name, (uses.get(name) ?? 0) + 1));

  return [...uses]
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);
}

// clicks that ask for a new tab or window are left to the browser
const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export default function BlogList({ username, blog, openPost, filters, setFilters }) {
  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery(postsQuery(username));
  if (isPending) return <DefragSpinner/>
  if (isError) {
    return (
      <>
        <p>
          I couldn't load the posts right now. You can still read them
          on <a href={blog} target="_blank" rel="noopener noreferrer">dev.to</a>.
        </p>
        <Button className="pointer" onClick={() => refetch()}>Try again</Button>
      </>
    )
  }
  // posts published under an organization, like the Meteor blog, are opt-in
  const organizations = [...new Set(data.filter((post) => post.organization).map((post) => post.organization.name))];
  const listed = filters.organizations ? data : data.filter((post) => !post.organization);
  const tags = getSharedTags(listed);
  // a tag can leave the list above when the organizations are unticked
  const tag = tags.includes(filters.tag) ? filters.tag : null;
  const posts = tag ? listed.filter((post) => post.tag_list.includes(tag)) : listed;
  return (
    <>
      {organizations.length > 0 && (
        <Filter
          checked={filters.organizations}
          onChange={(event) => setFilters({ ...filters, organizations: event.target.checked })}
        >
          Include the posts I wrote for the {organizations.join(' and ')} blog
        </Filter>
      )}
      <Tags>
        {tags.map((name) => (
          <Tag
            key={name}
            className="pointer"
            aria-pressed={name === tag}
            onClick={() => setFilters({ ...filters, tag: name === tag ? null : name })}
          >
            #{name}
          </Tag>
        ))}
      </Tags>
      <ul
        style={{
          paddingLeft: "1rem",
        }}
      >
        {posts.map(
          (post) => (
            <li key={post.id}>
              <h3>
                <a
                  href={`/blog/${post.id}`}
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;
                    event.preventDefault();
                    openPost(post);
                  }}
                >
                  {post.title}
                </a>
              </h3>
              <p>
                {post.readable_publish_date} - Reading time: {post.reading_time_minutes} minutes.
                <br />
                {post.tag_list.map((name) => `#${name}`).join(' ')}
              </p>
              <p>{post.description}</p>
              <Actions>
                <Button className="pointer" onClick={() => openPost(post)}>Read here</Button>
                <a href={post.url} target="_blank" rel="noopener noreferrer">Read more on dev.to</a>
              </Actions>
            </li>
          )
        )}
      </ul>
    </>
  );

}
