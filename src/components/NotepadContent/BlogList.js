import React from 'react'
import { useQuery } from "react-query";
import DefragSpinner from "./DefragSpinner";

export default function BlogList() {
  const {
    data,
    isLoading,
  } = useQuery('blog',
    () => fetch('https://dev.to/search/feed_content?per_page=15&page=0&user_id=895194&class_name=Article&sort_by=published_at&sort_direction=desc&approved=').then(res => res.json()));
  if (isLoading) return <DefragSpinner/>
  const dataList = data
    .result
    .map(
      ({
         id,
         title,
         path,
         reading_time,
         readable_publish_date,
       }) => ({
        id,
        title,
        path,
        reading_time,
        readable_publish_date,
      })
    )
  return (
    <ul
      style={{
        padding: "1rem",
      }}
    >
      {dataList.map(
        ({ id, title, path, reading_time, readable_publish_date }) => (
          <li key={id}>
            <h3>
              {title} - {readable_publish_date}
            </h3>
            <p>
              Reading time: {reading_time} minutes.{" "}
              <a href={`https://dev.to${path}`}>Link</a>
            </p>
          </li>
        )
      )}
    </ul>
  );

}
