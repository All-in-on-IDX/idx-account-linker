import { connect } from "react-redux"
import {
  Box, useClipboard, Text, Stack, Button, useToast, Link
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { setFailed, setPasted } from './Reducer'

const LinkMyCo = ({ did, pasted, failed }) => {
  const { onCopy } = useClipboard(did)
  const toast = useToast()
  return (
    <Box><Stack align='center'>
      {(!pasted || failed) &&
        <Button onClick={() => {
          setPasted(true)
          setFailed(false)
        }}
        background='green.100'
        >
          Link myColorado
        </Button>}
    </Stack></Box>
  )
}

export default connect(
  (state) => {
    const { did, pasted, failed } = state
    return {
      did, pasted, failed,
    }
  }
)(LinkMyCo)