import React, { useState, useContext, useEffect } from 'react'
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
  const [explorerOpened, toggleExplorer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notepadOpened, toggleNotepad] = useState(false);
  const [items, setItems] = useState([]);


  useEffect(
    () => {
      const files = data.getItems();
      setItems(files);
      toggleExplorer(true);
      const item = getItemByUrl(data)
      setSelectedItem(item);
      toggleNotepad(true);
    }, [data, isMobile]);

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
    <React.Fragment>
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
    </React.Fragment>
  )
}

export default Desktop
