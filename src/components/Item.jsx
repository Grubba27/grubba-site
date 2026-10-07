import styled from 'styled-components'
import {Inetcfg2301, FlyingThroughSpace100, Notepad2, InfoBubble, Progman1} from '@react95/icons'

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
const Icons = {
  inetcfg_2301: Inetcfg2301,
  flying_through_space_100: FlyingThroughSpace100,
  notepad_2: Notepad2,
  info_bubble: InfoBubble,
  progman_11: Progman1,
}
export default function Item({ item, openNotepad }) {
  const {name, icon } = item;
  const Icon  = Icons[icon] || Inetcfg2301;
  return (
    <StyledItem onClick={() => openNotepad(item)}>
      <Icon
        className="pointer"
      />
      <StyledSpan>{name}</StyledSpan>
    </StyledItem>
  )
}
