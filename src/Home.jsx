import { connect } from 'react-redux'
import { useState } from 'react'
import ConnectWallet from './ConnectWallet'
import CreateMyCoCred from './CreateMyCoCred'
import LinkMyCo from './LinkMyCo'
import { Stack } from '@chakra-ui/react'
import { theme, ThemeProvider, CSSReset } from "@chakra-ui/react";

const Home = ({ address, username, did, pasted }) => {
  const [ceramic, setCeramic] = useState()
  const comps = []
  comps.push(<ConnectWallet {...{ setCeramic }} key={1}/>)
  if(did) {
    comps.push(<LinkMyCo key={2}/>)
    if(pasted) {
      comps.push(<CreateMyCoCred {...{ ceramic }} key={3}/>)
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Stack align='center' spacing={5}>{comps}</Stack>
    </ThemeProvider>
  )
}

export default connect(state => {
  const { address, username, did, pasted } = state
  return { address, username, did, pasted }
})(Home)