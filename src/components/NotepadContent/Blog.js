import React from 'react'


function Blog({ content, isMobile }) {
  const { blog } = content;
  return (
    <div>
      <h2>Bellow there is the link for my blog :)</h2>
      <br />
      <a href={blog}>link</a>
    </div>
  )
}

export default Blog
