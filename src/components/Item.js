import React from 'react'
import styled from 'styled-components'
import {Inetcfg2301, FlyingThroughSpace100, Notepad2, InfoBubble, Progman11} from '@react95/icons'

const StyledItem = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-direction: column;
	text-align: center;
	width: 25%;
	padding: 10px 0;
`;

const StyledSpan = styled.span`
	margin-top: 5px;
`
const getIcon = (icon) => {

  switch (icon) {
    case 'inetcfg_2301':
      return Inetcfg2301 
    case 'flying_through_space_100':
      return FlyingThroughSpace100 
    case 'notepad_2':
      return Notepad2 
    case 'info_bubble':
      return InfoBubble
    case 'progman_11':
      return Progman11
    default:
      return Inetcfg2301 
  }
}
export default function Item({ item, openNotepad }) {
  const {name, icon } = item;
  const Icon  = getIcon(icon);
  return (
    <StyledItem onClick={() => openNotepad(item)}>
      <Icon
        className="pointer"
      />
      <StyledSpan>{name}</StyledSpan>
    </StyledItem>
  )
}
