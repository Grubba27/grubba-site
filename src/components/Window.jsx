import styled from 'styled-components'
import { Button, Modal, TitleBar } from '@react95/core'

// @react95/core 9 restyled the window chrome; these rules keep the 2.x look.
const StyledModal = styled(Modal)`
  && {
    padding: 2px 2px 8px;
    box-shadow: inset 1px 1px 0px 1px #ffffff, inset 0 0 0 1px #868a8e, 1px 1px 0 1px #000000;
  }

  & > .draggable {
    height: 18px;
    padding: 2px 2px 0;
  }

  & > .draggable > svg {
    width: 15px;
    height: 13px;
  }

  & > .draggable > div:first-of-type {
    flex-shrink: 1;
    color: inherit;
    font-weight: bold;
    line-height: normal;
    letter-spacing: normal;
    text-shadow: none;
  }

  & > .draggable button {
    font-weight: normal;
  }

  & > ul {
    padding-top: 0;
    padding-bottom: 3px;
  }

  /* the open menu is highlighted with the title bar color */
  & > ul > li {
    --r95-color-material: #000e7a;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 6px;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0 6px 6px 6px;

  & button {
    margin-right: 6px;
    min-width: 70px;
  }

  & button:last-child {
    margin-right: 0;
  }
`;

function Window({ icon, title, closeModal, buttons = [], menu, style, children }) {
  return (
    <StyledModal
      icon={icon}
      title={title}
      titleBarOptions={[
        <TitleBar.Option key="help">?</TitleBar.Option>,
        <TitleBar.Option key="close" onClick={closeModal}>x</TitleBar.Option>,
      ]}
      menu={menu}
      style={style}>
      <Content>{children}</Content>
      {
        buttons.length > 0 && (
          <Buttons>
            {
              buttons.map(({ value, onClick }) => (
                <Button key={value} onClick={onClick}>{value}</Button>
              ))
            }
          </Buttons>
        )
      }
    </StyledModal>
  )
}

export default Window
