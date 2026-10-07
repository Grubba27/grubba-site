import React from 'react'
import { Defrag, Defrag1, Defrag8, Defrag9 } from '@react95/icons'

export default function DefragSpinner() {
  const spinnerList = [Defrag, Defrag1, Defrag8, Defrag9]
  const [spinner, setSpinner] = React.useState(0)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSpinner((spinner + 1) % 4)
    }, 300)
    return () => clearInterval(interval)
  })
  const Spinner = spinnerList[spinner]
  return <Spinner />
}
