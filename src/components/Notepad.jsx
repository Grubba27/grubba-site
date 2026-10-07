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
        // a new frame per file, so each one opens at the top instead of where the last one was scrolled to
        key={ selectedItem.id }
        bg="white"
        boxShadow="$in"
        height="100%"
        padding="$20"
        style={ {
          overflowY: "auto",
          // on mobile the window starts lower, so its text has to end sooner to stay above the taskbar
          maxHeight: isMobile ? "calc(65dvh - 127px)" : "60vh",
        } }
      >
        <ContentFactory id={ selectedItem.id }/>
      </Frame>
    </Window>
  )
}

export default Notepad
