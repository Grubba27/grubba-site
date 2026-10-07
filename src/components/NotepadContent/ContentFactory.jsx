import { useContext } from 'react'

import About from './About'
import Resume from './Resume'
import Contact from './Contact'
import Blog from "./Blog";

import { Context } from "../../services/data";

function ContentFactory({ id }) {
  const data = useContext(Context);
  const item = data.getItem(id);

  if (!item) {
    return (<div></div>);
  }

  switch (item.id) {
    case 'about':
      return <About content={item.content} />
    case 'resume':
      return <Resume content={item.content} />
    case 'contact':
      return <Contact content={item.content} />
    case 'blog':
      return <Blog content={item.content}  />

    default:
      return (<div></div>);
  }

}

export default ContentFactory
