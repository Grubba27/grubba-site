import { useLayoutEffect, useRef, useState } from 'react'
import BlogList from "./BlogList";
import BlogPost from "./BlogPost";
import { navigate, usePathname } from "../../services/navigation";

// what scrolls is the Notepad around the content, not the page
const getScroller = (node) => {
  for (let el = node?.parentElement; el; el = el.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(el).overflowY)) return el;
  }
  return null;
}

function Blog({ content }) {
  const { blog, username } = content;
  // /blog is the list of posts, /blog/123 is a post
  const postId = usePathname().split('/')[2];
  // kept here so the list is the same when coming back from a post
  const [withOrganizations, setWithOrganizations] = useState(false);
  const wrapper = useRef(null);
  const listScroll = useRef(0);

  // a post starts at its top, the list comes back to where it was left
  useLayoutEffect(() => {
    const scroller = getScroller(wrapper.current);
    if (scroller) scroller.scrollTop = postId ? 0 : listScroll.current;
  }, [postId]);

  const openPost = (post) => {
    listScroll.current = getScroller(wrapper.current)?.scrollTop ?? 0;
    navigate(`/blog/${ post.id }`);
  };

  return (
    <div ref={ wrapper }>
      {
        postId
          ? <BlogPost id={ postId } username={ username } blog={ blog } closePost={ () => navigate('/blog') }/>
          : (
            <>
              <h2>Blog</h2>
              <p>
                These are my latest posts from <a href={ blog } target="_blank" rel="noopener noreferrer">dev.to</a>.
                Pick one to read it right here.
              </p>
              <BlogList
                username={ username }
                blog={ blog }
                openPost={ openPost }
                withOrganizations={ withOrganizations }
                setWithOrganizations={ setWithOrganizations }
              />
            </>
          )
      }
    </div>
  )
}

export default Blog
