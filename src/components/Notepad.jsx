import { Frame } from '@react95/core'
import { Notepad1 } from '@react95/icons'
import Window from './Window'
import ContentFactory from './NotepadContent/ContentFactory';

// module-level so the element stays the same between renders: a new icon makes the window register again
const icon = <Notepad1 variant="16x16_4" />

function Notepad({ closeNotepad, selectedItem, isMobile }) {

  return (
    <Window
      icon={icon}
      title={ `Notepad - ${ selectedItem.name }` }
      closeModal={ closeNotepad }
      buttons={ [{ value: "Close", onClick: closeNotepad }] }
      style={ {
        left: isMobile ? '5%' : '50%',
        top: isMobile ? '35%' : '15%',
        width: isMobile ? '90%' : 450,
      } }
      menu={ [
        { name: 'File', list: [] },
        { name: 'Edit', list: [] }
      ] }>
      <Frame
        bg="white"
        boxShadow="$in"
        height="100%"
        padding="$20"
        style={ {
          overflowY: "auto",
          maxHeight: "60vh",
        } }
      >
        <ContentFactory id={ selectedItem.id }/>
      </Frame>
    </Window>
  )
}

export default Notepad
