import React, { useState, useContext, useEffect } from 'react'
import Explorer from './Explorer'
import Notepad from './Notepad';
import Shortcuts from './Shortcuts';
import { Context } from "../services/data";
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
      setSelectedItem(files[0]);
      toggleNotepad(true);
    }, [data, isMobile]);


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
      <Shortcuts openExplorer={openExplorer} />
      {
        explorerOpened && (
          <Explorer items={items} closeExplorer={closeExplorer} openNotepad={openNotepad} isMobile={isMobile} />
        )
      }
      {
        notepadOpened && (
          <Notepad closeNotepad={closeNotepad} selectedItem={selectedItem} isMobile={isMobile} />
        )
      }
    </React.Fragment>
  )
}

export default Desktop
