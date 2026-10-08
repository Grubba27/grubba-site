import { useQuery } from "@tanstack/react-query";
import { Button } from "@react95/core";
import styled from "styled-components";
import DefragSpinner from "./DefragSpinner";
import { PERSONAL, getSource, postsQuery } from "../../services/devto";

const Tags = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`

// a tag that is on stays pressed in, like the button of the open window in the taskbar
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

// clicks that ask for a new tab or window are left to the browser
const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export default function BlogList({ username, blog, openPost, sources, setSources }) {
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
  const organizations = new Map(
    data.filter((post) => post.organization).map((post) => [getSource(post), `${post.organization.name} blog`])
  );
  const tags = [
    { source: PERSONAL, name: 'Personal' },
    ...Array.from(organizations, ([source, name]) => ({ source, name })),
  ];
  const toggle = (source) => {
    const next = sources.includes(source) ? sources.filter((selected) => selected !== source) : [...sources, source];
    // with nothing selected there would be nothing to read
    if (next.length > 0) setSources(next);
  };
  const posts = data.filter((post) => sources.includes(getSource(post)));
  return (
    <>
      {tags.length > 1 && (
        <Tags>
          {tags.map(({ source, name }) => (
            <Tag
              key={source}
              className="pointer"
              aria-pressed={sources.includes(source)}
              onClick={() => toggle(source)}
            >
              {name}
            </Tag>
          ))}
        </Tags>
      )}
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
