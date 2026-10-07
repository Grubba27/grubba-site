import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@react95/core";
import styled from "styled-components";
import DefragSpinner from "./DefragSpinner";
import { postQuery, postsQuery } from "../../services/devto";
import { sanitizePostHtml } from "../../services/sanitizePost";

const Body = styled.article`
  overflow-wrap: anywhere;

  & h2 {
    font-size: 1.25em;
  }

  & h3 {
    font-size: 1.1em;
  }

  & img {
    max-width: 100%;
    height: auto;
  }

  /* every element gets the system font from a global rule, so code has to opt out one by one */
  & pre,
  & pre *,
  & code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
  }

  & pre {
    overflow-x: auto;
    padding: 8px;
    border: 1px solid #868a8e;
  }

  & blockquote {
    margin: 15px 0;
    padding-left: 12px;
    border-left: 2px solid #868a8e;
  }

  & .ltag__twitter-tweet {
    padding: 8px 12px;
    border: 1px solid #868a8e;
  }

  & .ltag__twitter-tweet__full-name {
    font-weight: bold;
  }
`

export default function BlogPost({ id, username, blog, closePost }) {
  const queryClient = useQueryClient();
  const {
    data: post,
    isPending,
    isError,
  } = useQuery({
    ...postQuery(id),
    // coming from the list, its title and date are shown while the text loads
    placeholderData: () =>
      queryClient.getQueryData(postsQuery(username).queryKey)?.find((listed) => String(listed.id) === id),
  });
  const body = useMemo(() => post?.body_html ? sanitizePostHtml(post.body_html) : null, [post]);

  const back = <Button className="pointer" onClick={closePost}>&lt; Back to posts</Button>

  if (isError) {
    return (
      <>
        {back}
        <p>
          I couldn't load this post right now. You can still read it
          on <a href={blog} target="_blank" rel="noopener noreferrer">dev.to</a>.
        </p>
      </>
    )
  }

  const readMore = post && <a href={post.url} target="_blank" rel="noopener noreferrer">Read more on dev.to</a>

  return (
    <>
      {back}
      {post && (
        <>
          <h2>{post.title}</h2>
          <p>
            {post.readable_publish_date} - Reading time: {post.reading_time_minutes} minutes. {readMore}
          </p>
          <hr />
        </>
      )}
      {(isPending || body === null) && <DefragSpinner/>}
      {body !== null && (
        <>
          <Body lang={post.language} dangerouslySetInnerHTML={{ __html: body }}/>
          <hr />
          <p>{readMore}</p>
          {back}
        </>
      )}
    </>
  )
}
