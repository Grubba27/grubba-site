import React from 'react'
import styled from 'styled-components'
import { Modal, Frame } from '@react95/core'
import Item from './Item'

const FilesWrapper = styled.div`
	display: flex;
	grid-template-columns: repeat(4, 1fr);
	flex-wrap: wrap;
`;


function Explorer({ items, closeExplorer, openNotepad, isMobile }) {
  return (
    <Modal
      icon="explorer_100_16x16_4bit"
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
        boxShadow="in"
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
    </Modal>
  )
}

export default Explorer
