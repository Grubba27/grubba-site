import React, { useContext } from 'react'
import { TaskBar, List } from '@react95/core'
import styled from 'styled-components'
import { Context } from '../services/data'
const Link = styled.a`
    text-decoration: none;
    color: inherit;
`


function Taskbar() {
  const { projectRepo, react95Repo, original } = useContext(Context).getProjectInfo();
  return (
    <TaskBar
      list={
        <List>
          <List.Item className="pointer" icon="brush">
            <Link href={react95Repo} target="_blank">Built with React95</Link>
          </List.Item>
          <List.Divider />
          <List.Item className="pointer" icon="brush">
            <Link href={original} target="_blank">Original repo by Insaf Khamzin</Link>
          </List.Item>
          <List.Divider />
          <List.Item className="pointer" icon="folder_file">
            <Link href={projectRepo} target="_blank">Repo</Link>
          </List.Item>
        </List>
      }
    />
  )
}

export default Taskbar
