import { about } from './about';
import { resume } from "./resume";
import { contact } from "./contact";
import { projects } from "./projects";
import { createContext } from 'react';
import { blog } from "./blog";
const Data = () => {
  const projectRepo = 'https://github.com/Grubba27/grubba-site';
  const react95Repo = 'https://github.com/React95/React95';
  const original = 'https://github.com/InsafKhamzin/portfolio';
  const items = [
    about,
    resume,
    contact,
    projects,
    blog
  ];
  const getItems = () =>
    items.map(({ id, name, icon }) => ({ id, name, icon }));

  const getItem = (id) =>
    items.find(item => item.id === id);


  const getProjectInfo = () => {
    return {
      projectRepo,
      react95Repo,
      original
    }
  }

  return {
    getItems,
    getItem,
    getProjectInfo,
  }
}
const Context = createContext();
export {
  Context,
  Data,
}
