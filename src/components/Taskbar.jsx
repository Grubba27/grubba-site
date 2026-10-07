import { useContext } from 'react'
import { TaskBar, List } from '@react95/core'
import styled from 'styled-components'
import { Context } from '../services/data'
import rightCaret from '../assets/win95/pattern/rightcaret.svg'

const Link = styled.a`
    text-decoration: none;
    color: inherit;
`

// @react95/core 9 restyled the taskbar and its menu; these rules keep the 2.x look.
const StyledTaskBar = styled(TaskBar)`
  & > button {
    padding-inline: 3px;
  }

  /* the start button while its menu is open */
  & > div + button {
    padding-left: 4px;
    padding-right: 2px;
  }
`

const StartMenu = styled(List)`
  && {
    width: 200px;
    box-shadow: inset 1px 1px 0px 1px #ffffff, inset 0 0 0 1px #868a8e, 1px 1px 0 1px #000000;
  }
`

const StartMenuItem = styled(List.Item)`
  && {
    padding-inline-start: 16px;
  }

  &&::after {
    position: absolute;
    width: 5px;
    height: 8px;
    right: 8px;
    content: '';
    background-color: #000000;
    mask-image: url("${rightCaret}");
    mask-position: center center;
    mask-size: 5px 8px;
    mask-repeat: no-repeat;
  }

  &&:hover::after {
    background-color: #ffffff;
  }
`


function Taskbar() {
  const { projectRepo, react95Repo, original } = useContext(Context).getProjectInfo();
  return (
    <StyledTaskBar
      list={
        <StartMenu>
          <StartMenuItem className="pointer">
            <Link href={react95Repo} target="_blank">Built with React95</Link>
          </StartMenuItem>
          <List.Divider />
          <StartMenuItem className="pointer">
            <Link href={original} target="_blank">Original repo by Insaf Khamzin</Link>
          </StartMenuItem>
          <List.Divider />
          <StartMenuItem className="pointer">
            <Link href={projectRepo} target="_blank">Repo</Link>
          </StartMenuItem>
        </StartMenu>
      }
    />
  )
}

export default Taskbar
