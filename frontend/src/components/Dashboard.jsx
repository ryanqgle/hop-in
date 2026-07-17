import { useState, useEffect } from 'react'
import {
    Container,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Spinner,
    Center
} from '@chakra-ui/react'
import { useAuth } from '../auth.jsx'
import { apiUrl } from '../api'
import TripsFeed from './TripsFeed.jsx'
import DriverRequests from './DriverRequests.jsx'

export default function Dashboard() {
    const { token } = useAuth()
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return

        fetch(apiUrl('/api/edit-profile'), {
            headers: { 'Authorization': `Bearer ${token}` },
            })
            .then((res) => res.json())
            .then((data) => {
                if (data?.status === 'success') setRole(data.profile?.role)
                setLoading(false)
            })
    }, [token])

    if (loading) {
        return <Center mt={20}><Spinner size="xl" /></Center>
    }

    return (
        <Container maxW="md" h="100vh" p={0} display="flex" flexDir="column">
            <Tabs isFitted colorScheme="blue" display="flex" flexDir="column" flex="1">
                <TabList>
                    <Tab fontWeight="bold">Available Trips</Tab>
                    <Tab fontWeight="bold">Activity</Tab>
                </TabList>

                <TabPanels flex="1" overflowY="auto">
                    <TabPanel p={0}>
                        <TripsFeed />
                    </TabPanel>

                    <TabPanel p={0}>
                        {role === 'driver' ? (
                             <DriverRequests />
                        ) : (
                            {/* <RiderActivity /> */}
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Container>
    )
}