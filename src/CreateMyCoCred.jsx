import { useState, useEffect } from 'react'
import { connect } from "react-redux"
import {
  Box, Spinner, Text, Alert, AlertDescription, AlertIcon
} from '@chakra-ui/react'
import { IDX } from '@ceramicstudio/idx'
import { definitions } from './docIDs.json'
import { setFailed } from './Reducer'

const verifier = 'http://localhost:3001'
// const verifier = 'https://oiekhuylog.execute-api.us-west-2.amazonaws.com/develop'
const idxKey = 'aka'

// Reverse base 64 encoding to an object if possible
const deB64 = (str) => {
  const de = Buffer.from(str, 'base64').toString()
  try {
    return JSON.parse(de)
  } catch(err) {
    return de
  } 
}

const MOCK_BODY = {
    Merchant: 5,
    MerchantName: 'EthDenver',
    Version: '08/26/2020',
    MerchantType: 'Merchant',
    RequestedDate: 'Fri Jan 28 21:02:18 UTC 2021',
    Name: 'EthDevner Multiply',
    DisplayName: 'RICARDO, RICKY',
    County: 'Jefferson County',
    EmailAddress: 'woot@gmail.com',
    MerchantPassthruData: {
      Message:
        '<Whatever you want to pass to the Mobile App message to the user.>',
      ControlCode: ''
    },
    MobileNumber: '3035551212',
    FirstName: 'RICKY',
    LastName: 'RICARDO',
    Zip: '80003',
    City: 'ARVADA',
    State: 'CO',
    Last4: '9089',
    DOB: 'MMDDYY',
    CIN: 'DL#',
    CoResident: 'true/false',
    Image: '<uuencoded image>',
    merchant_id: 5
  }

const CreateMyCoCred = ({ did, failed, ceramic }) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState()
  const [vc, setVC] = useState()
  const create = async () => {
    try {
      let url = `${verifier}/api/v0/request-myco`
      console.info(JSON.stringify(
        { did }
      ))
      let res = await fetch(url, {
        method: 'post',
        body: JSON.stringify(
          { did }
        ),
      })
      let datum = await res.json()
      const challengeCode = datum?.data?.challengeCode

      if(!challengeCode) throw new Error("Couldn't generate challenge")

      let body = MOCK_BODY
      body.MerchantPassthruData.ControlCode = challengeCode

      url = `${verifier}/api/v0/verify-myco-webhook`
      res = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
      })

      datum = await res.json()
      if(datum.status === 'error') throw new Error(datum.message)
      if(datum.status >= 300) throw new Error(datum.body)
      const att = datum?.data?.attestation
      if(!att) throw new Error('missing attestation')
      const parts = att?.split('.').map(deB64)

      setVC(JSON.stringify(parts[1], null, 4))
      //   const acct = parts[1].vc.credentialSubject.account

    //   const account = {
    //     protocol: 'https',
    //     host: 'github.com',
    //     id: acct.username,
    //     claim: acct.url,
    //     attestations: [{ 'did-jwt-vc': att }]
    //   }

    //   const idx = new IDX({ ceramic, aliases: definitions })

    //   const aka = (await idx.get(idxKey)) || { accounts: [] }

    //   console.info('existing', { ...aka })

    //   if(!aka.accounts) throw new Error(`malformed ${idxKey} entry`)
    //   aka.accounts.push(account)

    //   console.info('new', { ...aka })

    //   console.info('repo', (await idx.merge(idxKey, aka)).toUrl())
      setDone(true)
    } catch(err) {
      console.error(err)
      setError(err.message)
      setFailed(true)
    }
  }

  useEffect(() => {
    if(!failed) {
      setError()
      create()
    }
  }, [failed])

  if(error) {
    return (
      <Box><Alert status="error">
        <AlertIcon />
        <AlertDescription>{error}</AlertDescription>
      </Alert></Box>
    )
  }

  if(!done) {
    return (
      <Box align='center'>
        <Text>Connecting myColorado...</Text>
        <span> </span>
        <Spinner/>
      </Box>
    )
  }

  return (
    <Box align='center'><Text>Verified myColorado credential:</Text><Text>{JSON.stringify(vc, null, 4)}</Text></Box>
  )
}

export default connect(
  (state) => {
    const { did, failed } = state
    return {
      did, failed,
    }
  }
)(CreateMyCoCred)