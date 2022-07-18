import React from 'react'
import styled from 'styled-components'


function Skills({ content, isMobile }) {
  const { blog } = content;
  return (
    <div>
      <h2>Bellow there is the link for my blog :)</h2>
      <br />
      <a href={blog}>link</a>
    </div>
  )
}

export default Skills
