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

const Actions = styled.p`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`

// clicks that ask for a new tab or window are left to the browser
const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export default function BlogList({ username, blog, openPost, withOrganizations, setWithOrganizations }) {
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
  const posts = withOrganizations ? data : data.filter((post) => !post.organization);
  return (
    <>
      {organizations.length > 0 && (
        <Filter
          checked={withOrganizations}
          onChange={(event) => setWithOrganizations(event.target.checked)}
        >
          Include the posts I wrote for the {organizations.join(' and ')} blog
        </Filter>
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
