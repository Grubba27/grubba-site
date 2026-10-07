import { useState, useContext, useEffect } from 'react'
import Explorer from './Explorer'
import Notepad from './Notepad';
import Shortcuts from './Shortcuts';
import { Context } from "../services/data";

const getItemByUrl = (data) => {
  const url = window.location.pathname;
  const defaultItem = data.getItems()[0];

  if (url === '/') return defaultItem;
  const item = data.getItem(url.slice(1));

  if (item) return item;
  else return defaultItem;
}

function Desktop() {

  const isMobile = window.innerWidth < 850;

  const data = useContext(Context);
  const [explorerOpened, toggleExplorer] = useState(true);
  const [selectedItem, setSelectedItem] = useState(() => getItemByUrl(data));
  const [notepadOpened, toggleNotepad] = useState(true);
  const items = data.getItems();

  useEffect(() => {
    if (!selectedItem) return
    window.history.pushState({}, selectedItem.name, `/${ selectedItem.id }`);
  }, [selectedItem])
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
    setSelectedItem(item)
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
