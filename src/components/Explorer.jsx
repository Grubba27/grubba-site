import styled from 'styled-components'
import { Frame } from '@react95/core'
import { Explorer100 } from '@react95/icons'
import Window from './Window'
import Item from './Item'

const FilesWrapper = styled.div`
	display: flex;
	grid-template-columns: repeat(4, 1fr);
	flex-wrap: wrap;
`;

// module-level so the element stays the same between renders: a new icon makes the window register again
const icon = <Explorer100 variant="16x16_4" />


function Explorer({ items, closeExplorer, openNotepad, isMobile }) {
  return (
    <Window
      icon={icon}
      title="Explorer"
      closeModal={closeExplorer}
      style={{
        left: isMobile ? '20%' : '15%',
        top:  isMobile ? '2%' : '30%',
        width: isMobile ? '78%' : 400,
      }}
      menu={[
        { name: 'File', list: [] },
        { name: 'Edit', list: [] },
        { name: 'Help', list: [] },
      ]}>
      <Frame
        bg="white"
        boxShadow="$in"
        height="100%"
      >
        <FilesWrapper>
          {
            items.map((item) => (
              <Item
                key={item.id}
                item={item}
                openNotepad={openNotepad}
              />
            ))
          }
        </FilesWrapper>
      </Frame>
    </Window>
  )
}

export default Explorer
