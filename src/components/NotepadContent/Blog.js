import React from 'react'
import BlogList from "./BlogList";


function Blog({ content, isMobile }) {
  const { blog } = content;
  return (
    <div>
      <h2>Click <a href={ blog }>here</a> to see my blog.</h2>
      <h2>
        Or you can see my last 15 posts bellow:
      </h2>
      <BlogList/>
    </div>
  )
}

export default Blog
