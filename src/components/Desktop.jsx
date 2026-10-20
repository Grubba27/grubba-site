import { useState, useContext, useEffect } from 'react'
import Explorer from './Explorer'
import Notepad from './Notepad';
import Shortcuts from './Shortcuts';
import { Context } from "../services/data";
import { navigate, redirect, usePathname } from "../services/navigation";
import { fileTitle } from "../services/seo";

// the first segment of the URL is the open file: /resume, /blog/123
const getItemByUrl = (data, pathname) => {
  const defaultItem = data.getItems()[0];
  const [id] = pathname.slice(1).split('/');

  return data.getItem(id) || defaultItem;
}

function Desktop() {

  const isMobile = window.innerWidth < 850;

  const data = useContext(Context);
  const pathname = usePathname();
  const selectedItem = getItemByUrl(data, pathname);
  const [explorerOpened, toggleExplorer] = useState(true);
  const [notepadOpened, toggleNotepad] = useState(true);
  const items = data.getItems();

  useEffect(() => {
    if (pathname.split('/')[1] !== selectedItem.id) redirect(`/${ selectedItem.id }`);
  }, [pathname, selectedItem.id])

  // the same title the page arrived with (src/services/seo.js); a post names its tab itself
  const isPost = selectedItem.id === 'blog' && Boolean(pathname.split('/')[2]);
  useEffect(() => {
    if (!isPost) document.title = fileTitle(selectedItem.id);
  }, [isPost, selectedItem.id])
  const closeExplorer = () => {
    toggleExplorer(false);
  };

  const openExplorer = () => {
    toggleExplorer(true);
  };

  const closeNotepad = () => {
    toggleNotepad(false);
  };

  const openNotepad = (item) => {
    navigate(`/${ item.id }`);
    toggleNotepad(true);
  };

  return (
    <>
      <Shortcuts openExplorer={ openExplorer }/>
      {
        explorerOpened && (
          <Explorer items={ items } closeExplorer={ closeExplorer } openNotepad={ openNotepad } isMobile={ isMobile }/>
        )
      }
      {
        notepadOpened && (
          <Notepad closeNotepad={ closeNotepad } selectedItem={ selectedItem } isMobile={ isMobile }/>
        )
      }
    </>
  )
}

export default Desktop
