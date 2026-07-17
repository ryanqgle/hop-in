import {useEffect, useState} from 'react';
import {
    Navigate
} from 'react-router-dom';


const PaymentReturn = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('session_id')

        if (!sessionId) {
            setStatus("error");
            return;
        }

        fetch(`/api/session_status?session_id=${sessionId}`)
            .catch(setStatus('Error'))
            .then((res) => res.json())
            .then((data) => {
                setStatus(data.status);
                setCustomerEmail(data.customer_email)
            });

    }, []);
    if (status === 'null') {
        <section id="null">
            <p>
                Checking payment status...
            </p>
        </section>
    }
    if (status === 'open') {
        return (
            <Navigate to = '/payment' />
        )
    }
    if (status === 'complete') {
        return (
            <section id='success'>
                <p>
                    Success!
                </p>
            </section>
        )
    }
    if (status === 'error') {
        return (
            <section id='error'>
                <p>
                    Error with your request!
                </p>
            </section>
        )
    }

    return null;
}

export default PaymentReturn;