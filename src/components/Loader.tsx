import React from 'react'
import { Box, Spinner } from '@chakra-ui/react'

const Loader = ({ label }: any) => {
  return (
    <Box w="full" textAlign="center" p={12}>
      <Spinner size={'lg'} />
      <Box mt={3}>{label ?? 'Loading'}</Box>
    </Box>
  )
}

export default Loader
