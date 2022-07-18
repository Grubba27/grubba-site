import React, { useEffect, useState, useContext } from 'react'

import About from './About'
import Resume from './Resume'
import Contact from './Contact'
import Projects from './Projects'
import Blog from "./Blog";

import { Context } from "../../services/data";

function ContentFactory({ id, isMobile }) {
  const data = useContext(Context);
  const [item, setItem] = useState(null);

  useEffect(() => {
    const file = data.getItem(id);
    setItem(file);
  }, [id, data]);

  if (item === null) {
    return (<div></div>);
  }

  switch (item.id) {
    case 'about':
      return <About content={item.content} />
    case 'resume':
      return <Resume content={item.content} />
    case 'contact':
      return <Contact content={item.content} />
    case 'projects':
      return <Projects content={item.content} />
    case 'blog':
      return <Blog content={item.content}  />

    default:
      return (<div></div>);
  }

}

export default ContentFactory
